import type { AppData } from '../store/types';
import { CURRENT_VERSION, emptyAppData } from '../store/defaults';
import { LIFE_AREAS } from '../data/lifeAreas';
import { createId } from '../lib/id';
import { builtinExercises, builtinPrograms } from '../data/exerciseLibrary';

/**
 * Migration framework.
 *
 * Each migration upgrades a document from version N to N+1. They are applied in
 * sequence, so an old document of any version is brought up to CURRENT_VERSION
 * one step at a time. Adding a future migration is just adding an entry to
 * `MIGRATIONS`.
 *
 * Migrations are intentionally self-contained (they do not depend on the
 * current default/empty shape, which changes over time) so that an old document
 * always upgrades deterministically.
 *
 * Version 0 represents any legacy/unversioned document.
 */

type AnyRecord = Record<string, unknown>;
type Migration = (data: AnyRecord) => AnyRecord;

const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const now = () => new Date().toISOString();

export const MIGRATIONS: Record<number, Migration> = {
  // 0 -> 1: establish the v1 baseline shape, filling any missing collections.
  // `...data` first so unknown extra fields survive, then sanitized fields win.
  0: (data) => ({
    ...data,
    lifeAreas: LIFE_AREAS,
    tracks: asArray(data.tracks),
    tasks: asArray(data.tasks),
    routines: asArray(data.routines),
    routineProgress:
      data.routineProgress && typeof data.routineProgress === 'object'
        ? data.routineProgress
        : {},
    workouts: asArray(data.workouts),
    workoutHistory: asArray(data.workoutHistory),
    todaysWorkout: data.todaysWorkout ?? null,
    settings:
      data.settings && typeof data.settings === 'object'
        ? data.settings
        : { userName: 'Claus' },
    seeded: data.seeded === true,
    version: 1,
  }),

  // 1 -> 2: split the reusable exercise library out of workouts, and turn each
  // workout into a program made of ordered steps. Old embedded exercises are
  // de-duplicated into library exercises by (category + title).
  1: (data) => {
    const oldWorkouts = asArray(data.workouts) as AnyRecord[];
    const ts = now();

    const exercises: AnyRecord[] = [];
    const libraryByKey = new Map<string, string>(); // key -> exerciseId

    const ensureExercise = (title: string, category: string): string => {
      const key = `${category}|${title.trim().toLowerCase()}`;
      const existing = libraryByKey.get(key);
      if (existing) return existing;
      const id = createId();
      libraryByKey.set(key, id);
      exercises.push({
        id,
        title: title.trim() || 'Øvelse',
        category,
        bodyPart: 'fullbody', // unknown in v1; user can refine later
        createdAt: ts,
        updatedAt: ts,
      });
      return id;
    };

    const programs = oldWorkouts.map((w) => {
      const category = typeof w.category === 'string' ? w.category : 'bodyweight';
      const steps = asArray(w.exercises).map((raw) => {
        const oe = raw as AnyRecord;
        const durationSeconds =
          typeof oe.durationSeconds === 'number' ? oe.durationSeconds : null;
        const reps = typeof oe.reps === 'number' ? oe.reps : null;
        const sets = typeof oe.sets === 'number' ? oe.sets : 1;
        const exerciseId = ensureExercise(
          typeof oe.name === 'string' ? oe.name : 'Øvelse',
          category,
        );
        return {
          id: createId(),
          kind: 'exercise',
          exerciseId,
          sets: Math.max(1, sets),
          mode: durationSeconds ? 'time' : 'reps',
          amount: durationSeconds ?? reps ?? 10,
          restSeconds: typeof oe.restSeconds === 'number' ? oe.restSeconds : 0,
          weightKg: 0,
        };
      });
      return {
        id: typeof w.id === 'string' ? w.id : createId(),
        title: typeof w.name === 'string' ? w.name : 'Program',
        steps,
        createdAt: ts,
        updatedAt: ts,
      };
    });

    const oldToday = data.todaysWorkout as AnyRecord | null | undefined;
    const todaysProgram =
      oldToday && typeof oldToday.workoutId === 'string'
        ? { programId: oldToday.workoutId, date: oldToday.date }
        : null;

    const sessions = (asArray(data.workoutHistory) as AnyRecord[]).map((s) => ({
      id: typeof s.id === 'string' ? s.id : createId(),
      programId: typeof s.workoutId === 'string' ? s.workoutId : '',
      programName: typeof s.workoutName === 'string' ? s.workoutName : 'Program',
      completedAt: typeof s.completedAt === 'string' ? s.completedAt : ts,
      exercisesCompleted:
        typeof s.exercisesCompleted === 'number' ? s.exercisesCompleted : 0,
      exercisesTotal: typeof s.exercisesTotal === 'number' ? s.exercisesTotal : 0,
    }));

    const next: AnyRecord = { ...data, exercises, programs, sessions, todaysProgram, version: 2 };
    delete next.workouts;
    delete next.workoutHistory;
    delete next.todaysWorkout;
    return next;
  },

  // 2 -> 3: add the `image` field to exercises, and install the built-in
  // illustrated exercise library + poster programs for existing users
  // (idempotent by id, so user-created data and edits are preserved).
  2: (data) => {
    const existingExercises = asArray(data.exercises) as AnyRecord[];
    const existingIds = new Set(
      existingExercises.map((e) => (typeof e.id === 'string' ? e.id : '')),
    );
    // Ensure every existing exercise has an `image` field (default none).
    const withImage = existingExercises.map((e) =>
      'image' in e ? e : { ...e, image: null },
    );

    const newExercises = builtinExercises().filter((e) => !existingIds.has(e.id));

    const existingPrograms = asArray(data.programs) as AnyRecord[];
    const programIds = new Set(
      existingPrograms.map((p) => (typeof p.id === 'string' ? p.id : '')),
    );
    const newPrograms = builtinPrograms().filter((p) => !programIds.has(p.id));

    return {
      ...data,
      exercises: [...newExercises, ...withImage],
      programs: [...existingPrograms, ...newPrograms],
      version: 3,
    };
  },
};

/**
 * Bring a persisted document (of any version) up to CURRENT_VERSION.
 * Unknown/missing version is treated as 0.
 */
export function runMigrations(input: unknown): AppData {
  let data: AnyRecord =
    input && typeof input === 'object' ? { ...(input as AnyRecord) } : {};

  let version = typeof data.version === 'number' ? data.version : 0;

  while (version < CURRENT_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) {
      // No migration defined for this step: fail safe to defaults merged with
      // whatever we have, then stop.
      data = { ...(emptyAppData() as unknown as AnyRecord), ...data };
      break;
    }
    data = migrate(data);
    version = typeof data.version === 'number' ? data.version : version + 1;
  }

  // Ensure every current field exists, then stamp the version.
  data = { ...(emptyAppData() as unknown as AnyRecord), ...data };
  data.version = CURRENT_VERSION;
  return data as unknown as AppData;
}
