import type {
  Exercise,
  ExerciseStep,
  Program,
  ProgramStep,
  TodaysProgram,
  WorkoutCategory,
} from '../../store/types';

export const CATEGORY_LABELS: Record<WorkoutCategory, string> = {
  speediance: 'Speediance',
  bodyweight: 'Kropsvægt',
  mobility: 'Mobilitet',
};

export const CATEGORY_EMOJI: Record<WorkoutCategory, string> = {
  speediance: '🏋️',
  bodyweight: '💪',
  mobility: '🧘',
};

/**
 * Categories that support a weight (kg) value on a program step. Speediance
 * only for now; free weights / machines can be added here later.
 */
export const WEIGHT_CATEGORIES: ReadonlySet<WorkoutCategory> = new Set<WorkoutCategory>([
  'speediance',
]);

export function categorySupportsWeight(category: WorkoutCategory): boolean {
  return WEIGHT_CATEGORIES.has(category);
}

export function exerciseById(
  exercises: Exercise[],
  id: string,
): Exercise | undefined {
  return exercises.find((e) => e.id === id);
}

/**
 * Resolve the program chosen for today. The selection is only valid for the
 * date it was made on; a stale selection (from a previous day) resolves to null
 * so the user picks again.
 */
export function resolveTodaysProgram(
  todaysProgram: TodaysProgram | null,
  programs: Program[],
  today: string,
): Program | null {
  if (!todaysProgram) return null;
  if (todaysProgram.date !== today) return null;
  return programs.find((p) => p.id === todaysProgram.programId) ?? null;
}

export function exerciseStepCount(program: Program): number {
  return program.steps.filter((s) => s.kind === 'exercise').length;
}

/** Estimated duration of a program in minutes (work + rests + pauses). */
export function estimateMinutes(program: Program): number {
  let seconds = 0;
  for (const step of program.steps) {
    if (step.kind === 'pause') {
      seconds += step.seconds;
      continue;
    }
    const workPerSet = step.mode === 'time' ? step.amount : step.amount * 3.5;
    seconds += step.sets * workPerSet + step.sets * step.restSeconds;
  }
  return Math.max(1, Math.round(seconds / 60));
}

/** A short summary like "30 min · 3 øvelser". */
export function programSummary(program: Program): string {
  const count = exerciseStepCount(program);
  const label = count === 1 ? '1 øvelse' : `${count} øvelser`;
  return `${estimateMinutes(program)} min · ${label}`;
}

/** Representative category for a program's icon (from its first exercise). */
export function programCategory(
  program: Program,
  exercises: Exercise[],
): WorkoutCategory {
  const firstExercise = program.steps.find(
    (s): s is ExerciseStep => s.kind === 'exercise',
  );
  if (!firstExercise) return 'bodyweight';
  return exerciseById(exercises, firstExercise.exerciseId)?.category ?? 'bodyweight';
}

/** Dosage text for a step, e.g. "3 sæt × 10 reps · 20 kg · 60s pause". */
export function stepDose(step: ExerciseStep, exercise: Exercise | undefined): string {
  const amount = step.mode === 'time' ? `${step.amount} sek.` : `${step.amount} reps`;
  let text = `${step.sets} sæt × ${amount}`;
  if (exercise && categorySupportsWeight(exercise.category) && step.weightKg > 0) {
    text += ` · ${step.weightKg} kg`;
  }
  if (step.restSeconds > 0) {
    text += ` · ${step.restSeconds}s pause`;
  }
  return text;
}

/** Default dosage for a newly added exercise step, based on its category. */
export function defaultStepFor(exercise: Exercise): Omit<ExerciseStep, 'id'> {
  const mode = exercise.category === 'mobility' ? 'time' : 'reps';
  return {
    kind: 'exercise',
    exerciseId: exercise.id,
    sets: 3,
    mode,
    amount: mode === 'time' ? 40 : 10,
    restSeconds: 60,
    weightKg: 0,
  };
}

export function isExerciseStep(step: ProgramStep): step is ExerciseStep {
  return step.kind === 'exercise';
}
