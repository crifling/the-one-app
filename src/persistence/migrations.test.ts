import { describe, expect, it } from 'vitest';

import { CURRENT_VERSION } from '../store/defaults';
import { runMigrations } from './migrations';

describe('migration handling', () => {
  it('treats a document with no version as version 0 and upgrades it', () => {
    const migrated = runMigrations({ tasks: [{ id: 'x' }] });
    expect(migrated.version).toBe(CURRENT_VERSION);
    expect(migrated.tasks).toEqual([{ id: 'x' }]);
  });

  it('fills in all required collections from defaults', () => {
    const migrated = runMigrations({ version: 0 });
    expect(Array.isArray(migrated.tracks)).toBe(true);
    expect(Array.isArray(migrated.tasks)).toBe(true);
    expect(Array.isArray(migrated.routines)).toBe(true);
    expect(Array.isArray(migrated.exercises)).toBe(true);
    expect(Array.isArray(migrated.programs)).toBe(true);
    expect(Array.isArray(migrated.sessions)).toBe(true);
    expect(migrated.routineProgress).toEqual({});
    expect(migrated.lifeAreas.length).toBeGreaterThan(0);
  });

  it('preserves user data that already exists', () => {
    const migrated = runMigrations({
      version: 0,
      tracks: [{ id: 'track-1', name: 'Keep me' }],
      settings: { userName: 'Alex' },
    });
    expect(migrated.tracks).toHaveLength(1);
    expect(migrated.settings.userName).toBe('Alex');
  });

  it('is idempotent for a current-version document', () => {
    const current = runMigrations({ version: CURRENT_VERSION, tracks: [] });
    const again = runMigrations(current);
    expect(again).toEqual(current);
  });

  it('handles non-object input safely', () => {
    expect(runMigrations(null).version).toBe(CURRENT_VERSION);
    expect(runMigrations(undefined).version).toBe(CURRENT_VERSION);
  });
});

describe('v1 -> v2: workouts become exercises + programs', () => {
  const v1 = {
    version: 1,
    workouts: [
      {
        id: 'w1',
        name: 'Ben + core',
        category: 'speediance',
        estimatedMinutes: 30,
        exercises: [
          { id: 'oe1', name: 'Reverse lunges', sets: 3, reps: 10, durationSeconds: null, restSeconds: 60, note: null },
          { id: 'oe2', name: 'Plank', sets: 3, reps: null, durationSeconds: 40, restSeconds: 30, note: null },
        ],
      },
      {
        id: 'w2',
        name: 'Full body',
        category: 'bodyweight',
        estimatedMinutes: 20,
        // Reuses "Reverse lunges" but as a bodyweight exercise -> distinct library entry.
        exercises: [
          { id: 'oe3', name: 'Reverse lunges', sets: 2, reps: 12, durationSeconds: null, restSeconds: 45, note: null },
        ],
      },
    ],
    todaysWorkout: { workoutId: 'w1', date: '2026-07-21' },
    workoutHistory: [
      { id: 'h1', workoutId: 'w1', workoutName: 'Ben + core', completedAt: '2026-07-20T10:00:00Z', exercisesCompleted: 2, exercisesTotal: 2 },
    ],
  };

  it('creates a program per workout with ordered exercise steps', () => {
    const m = runMigrations(v1);
    expect(m.version).toBe(CURRENT_VERSION);
    // The two workout-derived programs exist (built-in poster programs are
    // also added by the subsequent v2->v3 step).
    expect(m.programs.filter((p) => ['w1', 'w2'].includes(p.id))).toHaveLength(2);
    const legs = m.programs.find((p) => p.id === 'w1');
    expect(legs?.title).toBe('Ben + core');
    expect(legs?.steps).toHaveLength(2);
  });

  it('de-duplicates library exercises by title + category', () => {
    const m = runMigrations(v1);
    const titles = m.exercises.map((e) => `${e.category}|${e.title}`);
    // "Reverse lunges" appears as speediance AND bodyweight => two entries.
    expect(titles).toContain('speediance|Reverse lunges');
    expect(titles).toContain('bodyweight|Reverse lunges');
    expect(m.exercises.filter((e) => e.title === 'Reverse lunges')).toHaveLength(2);
    // Plank appears once.
    expect(m.exercises.filter((e) => e.title === 'Plank')).toHaveLength(1);
  });

  it('maps reps vs time correctly from the old shape', () => {
    const m = runMigrations(v1);
    const legs = m.programs.find((p) => p.id === 'w1')!;
    const steps = legs.steps as Array<Extract<(typeof legs.steps)[number], { kind: 'exercise' }>>;
    const lunges = steps[0]!;
    const plank = steps[1]!;
    expect(lunges.mode).toBe('reps');
    expect(lunges.amount).toBe(10);
    expect(plank.mode).toBe('time');
    expect(plank.amount).toBe(40);
    expect(lunges.weightKg).toBe(0);
  });

  it('carries over today’s selection and history to the new fields', () => {
    const m = runMigrations(v1);
    expect(m.todaysProgram).toEqual({ programId: 'w1', date: '2026-07-21' });
    expect(m.sessions).toHaveLength(1);
    expect(m.sessions[0]!.programId).toBe('w1');
    expect(m.sessions[0]!.programName).toBe('Ben + core');
  });

  it('drops the obsolete v1 fields', () => {
    const m = runMigrations(v1) as unknown as Record<string, unknown>;
    expect(m.workouts).toBeUndefined();
    expect(m.workoutHistory).toBeUndefined();
    expect(m.todaysWorkout).toBeUndefined();
  });
});

describe('v2 -> v3: image field + built-in illustrated library', () => {
  it('adds an image field to existing exercises without one', () => {
    const m = runMigrations({
      version: 2,
      exercises: [{ id: 'mine', title: 'Custom', category: 'bodyweight', bodyPart: 'core' }],
      programs: [],
    });
    expect(m.version).toBe(CURRENT_VERSION);
    const mine = m.exercises.find((e) => e.id === 'mine');
    expect(mine).toBeTruthy();
    expect(mine).toHaveProperty('image', null);
  });

  it('installs the built-in exercises and poster programs', () => {
    const m = runMigrations({ version: 2, exercises: [], programs: [] });
    // A few known built-ins with images.
    const squat = m.exercises.find((e) => e.id === 'ex-squat');
    expect(squat?.title).toBe('Squat');
    expect(squat?.image).toContain('exercise-images/squat.webp');
    expect(m.programs.some((p) => p.id === 'program-core')).toBe(true);
    expect(m.exercises.length).toBeGreaterThanOrEqual(27);
  });

  it('does not duplicate built-ins that already exist (idempotent)', () => {
    const once = runMigrations({ version: 2, exercises: [], programs: [] });
    const twice = runMigrations({ ...once, version: 2 });
    const count = (arr: { id: string }[], id: string) =>
      arr.filter((x) => x.id === id).length;
    expect(count(twice.exercises, 'ex-squat')).toBe(1);
    expect(count(twice.programs, 'program-core')).toBe(1);
  });

  it('preserves user-added exercises and their images', () => {
    const m = runMigrations({
      version: 2,
      exercises: [{ id: 'mine', title: 'Custom', category: 'bodyweight', bodyPart: 'core', image: 'data:image/webp;base64,AAAA' }],
      programs: [],
    });
    const mine = m.exercises.find((e) => e.id === 'mine');
    expect(mine?.image).toBe('data:image/webp;base64,AAAA');
  });
});

describe('v3 -> v4: remove old placeholders, keep everything else', () => {
  const v3 = {
    version: 3,
    todaysProgram: { programId: 'program-legs', date: '2026-07-21' },
    programs: [
      { id: 'program-legs', title: 'Ben + core', steps: [{ id: 's', kind: 'exercise', exerciseId: 'old-1', sets: 3, mode: 'reps', amount: 10, restSeconds: 60, weightKg: 0 }] },
      { id: 'program-hotel', title: 'Hotel workout', steps: [{ id: 's', kind: 'exercise', exerciseId: 'old-2', sets: 3, mode: 'reps', amount: 10, restSeconds: 60, weightKg: 0 }] },
      { id: 'my-program', title: 'Mit program', steps: [{ id: 's', kind: 'exercise', exerciseId: 'mine-used', sets: 3, mode: 'reps', amount: 10, restSeconds: 60, weightKg: 0 }] },
    ],
    exercises: [
      { id: 'old-1', title: 'Reverse lunges', category: 'speediance', bodyPart: 'legs', image: null }, // placeholder from program-legs -> remove
      { id: 'old-2', title: 'Air squats', category: 'bodyweight', bodyPart: 'legs', image: null }, // placeholder from program-hotel -> remove
      { id: 'mine-unused', title: 'Ny egen øvelse', category: 'bodyweight', bodyPart: 'core', image: null }, // user, never in an old program -> keep
      { id: 'mine-used', title: 'Min øvelse', category: 'bodyweight', bodyPart: 'core', image: null }, // user, used by my-program -> keep
      { id: 'mine-photo', title: 'Med foto', category: 'bodyweight', bodyPart: 'core', image: 'data:image/webp;base64,AAAA' }, // user photo -> keep
      { id: 'ex-squat', title: 'Squat', category: 'bodyweight', bodyPart: 'legs', image: '/x.webp' }, // built-in -> keep
    ],
  };

  it('removes the old placeholder programs', () => {
    const m = runMigrations(v3);
    expect(m.version).toBe(CURRENT_VERSION);
    expect(m.programs.some((p) => p.id === 'program-legs')).toBe(false);
    expect(m.programs.some((p) => p.id === 'my-program')).toBe(true);
  });

  it('removes orphaned image-less placeholder exercises', () => {
    const ids = runMigrations(v3).exercises.map((e) => e.id);
    expect(ids).not.toContain('old-1');
    expect(ids).not.toContain('old-2');
  });

  it('keeps built-ins, user photos, and user exercises (used or not)', () => {
    const ids = runMigrations(v3).exercises.map((e) => e.id);
    expect(ids).toContain('ex-squat');
    expect(ids).toContain('mine-photo');
    expect(ids).toContain('mine-used');
    // A user-created exercise never part of an old program is preserved.
    expect(ids).toContain('mine-unused');
  });

  it('clears todaysProgram if it pointed at a removed program', () => {
    expect(runMigrations(v3).todaysProgram).toBeNull();
  });
});
