import type {
  BodyPartId,
  Exercise,
  ExerciseStep,
  Program,
  WorkoutCategory,
} from '../store/types';

// Built-in exercise library, sourced from the illustrated posters. Each entry
// has a stable id and a cropped figure stored under public/exercise-images/.
// Shared by the seed (fresh installs) and the migration (existing users).

const BUILTIN_TS = '2026-07-21T07:00:00.000Z';

export interface BuiltinExerciseDef {
  slug: string;
  title: string;
  category: WorkoutCategory;
  bodyPart: BodyPartId;
}

/** Resolve the bundled image path for a built-in exercise slug. */
export function builtinImagePath(slug: string): string {
  return `${import.meta.env.BASE_URL}exercise-images/${slug}.webp`;
}

export const exerciseId = (slug: string) => `ex-${slug}`;

export const BUILTIN_EXERCISES: BuiltinExerciseDef[] = [
  // Mobilitet 1
  { slug: 'cat-cow', title: 'Cat-cow', category: 'mobility', bodyPart: 'back' },
  { slug: 'cobra-child-pose', title: 'Cobra til child’s pose', category: 'mobility', bodyPart: 'back' },
  { slug: 'open-book-rotation', title: 'Open book rotation', category: 'mobility', bodyPart: 'back' },
  { slug: 'shoulder-cars', title: 'Shoulder CARs', category: 'mobility', bodyPart: 'shoulders' },
  { slug: 'hip-switches-90-90', title: '90/90 hip switches', category: 'mobility', bodyPart: 'legs' },
  // Mobilitet 2
  { slug: 'couch-stretch', title: 'Couch stretch', category: 'mobility', bodyPart: 'legs' },
  { slug: 'adductor-rock-back', title: 'Adductor rock-back', category: 'mobility', bodyPart: 'legs' },
  { slug: 'hamstring-floss', title: 'Hamstring floss', category: 'mobility', bodyPart: 'legs' },
  { slug: 'knee-to-wall-ankle', title: 'Knee-to-wall ankle mobilisering', category: 'mobility', bodyPart: 'legs' },
  { slug: 'deep-squat-pry', title: 'Deep squat pry', category: 'mobility', bodyPart: 'legs' },
  // Core
  { slug: 'plank-shoulder-taps', title: 'Plank shoulder taps', category: 'bodyweight', bodyPart: 'core' },
  { slug: 'side-plank', title: 'Side plank', category: 'bodyweight', bodyPart: 'core' },
  { slug: 'reverse-crunch', title: 'Reverse crunch', category: 'bodyweight', bodyPart: 'core' },
  { slug: 'hollow-body-hold', title: 'Hollow body hold', category: 'bodyweight', bodyPart: 'core' },
  { slug: 'copenhagen-plank', title: 'Copenhagen plank', category: 'bodyweight', bodyPart: 'core' },
  // Overkrop & kondition
  { slug: 'single-leg-calf-raise', title: 'Single-leg calf raise', category: 'bodyweight', bodyPart: 'legs' },
  { slug: 'push-up', title: 'Push-up', category: 'bodyweight', bodyPart: 'chest' },
  { slug: 'pike-push-up', title: 'Pike push-up', category: 'bodyweight', bodyPart: 'shoulders' },
  { slug: 'pull-up', title: 'Pull-up / chin-up', category: 'bodyweight', bodyPart: 'back' },
  { slug: 'inverted-row', title: 'Inverted row', category: 'bodyweight', bodyPart: 'back' },
  { slug: 'burpee', title: 'Burpee / squat thrust', category: 'bodyweight', bodyPart: 'cardio' },
  // Ben & bagkæde
  { slug: 'squat', title: 'Squat', category: 'bodyweight', bodyPart: 'legs' },
  { slug: 'reverse-lunge', title: 'Reverse lunge', category: 'bodyweight', bodyPart: 'legs' },
  { slug: 'lateral-lunge', title: 'Lateral lunge', category: 'bodyweight', bodyPart: 'legs' },
  { slug: 'sl-romanian-deadlift', title: 'Single-leg Romanian deadlift', category: 'bodyweight', bodyPart: 'glutes' },
  { slug: 'glute-bridge', title: 'Glute bridge / hip thrust', category: 'bodyweight', bodyPart: 'glutes' },
  { slug: 'hamstring-walkout', title: 'Hamstring walkout', category: 'bodyweight', bodyPart: 'glutes' },
];

/** Full Exercise records for the built-in library (with image + timestamps). */
export function builtinExercises(): Exercise[] {
  return BUILTIN_EXERCISES.map((d) => ({
    id: exerciseId(d.slug),
    title: d.title,
    category: d.category,
    bodyPart: d.bodyPart,
    image: builtinImagePath(d.slug),
    createdAt: BUILTIN_TS,
    updatedAt: BUILTIN_TS,
  }));
}

interface ProgramDef {
  id: string;
  title: string;
  items: Array<{
    slug: string;
    sets: number;
    mode: ExerciseStep['mode'];
    amount: number;
    rest: number;
  }>;
}

const reps = (slug: string, sets: number, amount: number, rest: number) =>
  ({ slug, sets, mode: 'reps' as const, amount, rest });
const time = (slug: string, sets: number, amount: number, rest = 0) =>
  ({ slug, sets, mode: 'time' as const, amount, rest });

export const BUILTIN_PROGRAMS: ProgramDef[] = [
  {
    id: 'program-mobilitet-1',
    title: 'Mobilitet 1',
    items: [
      time('cat-cow', 2, 60),
      time('cobra-child-pose', 2, 45),
      time('open-book-rotation', 2, 45),
      time('shoulder-cars', 2, 40),
      time('hip-switches-90-90', 2, 45),
    ],
  },
  {
    id: 'program-mobilitet-2',
    title: 'Mobilitet 2',
    items: [
      time('couch-stretch', 2, 45),
      time('adductor-rock-back', 2, 45),
      time('hamstring-floss', 2, 45),
      time('knee-to-wall-ankle', 2, 40),
      time('deep-squat-pry', 2, 45),
    ],
  },
  {
    id: 'program-core',
    title: 'Core',
    items: [
      reps('plank-shoulder-taps', 3, 16, 45),
      time('side-plank', 3, 30, 30),
      reps('reverse-crunch', 3, 12, 45),
      time('hollow-body-hold', 3, 30, 45),
      time('copenhagen-plank', 3, 20, 45),
    ],
  },
  {
    id: 'program-overkrop',
    title: 'Overkrop & kondition',
    items: [
      reps('single-leg-calf-raise', 3, 12, 45),
      reps('push-up', 3, 10, 60),
      reps('pike-push-up', 3, 8, 60),
      reps('pull-up', 3, 6, 90),
      reps('inverted-row', 3, 10, 60),
      reps('burpee', 3, 10, 60),
    ],
  },
  {
    id: 'program-ben-bagkaede',
    title: 'Ben & bagkæde',
    items: [
      reps('squat', 3, 12, 60),
      reps('reverse-lunge', 3, 10, 60),
      reps('lateral-lunge', 3, 10, 60),
      reps('sl-romanian-deadlift', 3, 10, 60),
      reps('glute-bridge', 3, 12, 45),
      reps('hamstring-walkout', 3, 10, 45),
    ],
  },
];

/** Full Program records for the built-in poster programs. */
export function builtinPrograms(): Program[] {
  return BUILTIN_PROGRAMS.map((p) => ({
    id: p.id,
    title: p.title,
    steps: p.items.map((it, i) => ({
      id: `${p.id}-s${i + 1}`,
      kind: 'exercise' as const,
      exerciseId: exerciseId(it.slug),
      sets: it.sets,
      mode: it.mode,
      amount: it.amount,
      restSeconds: it.rest,
      weightKg: 0,
    })),
    createdAt: BUILTIN_TS,
    updatedAt: BUILTIN_TS,
  }));
}
