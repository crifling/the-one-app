import type { TodaysWorkout, Workout, WorkoutCategory } from '../../store/types';

export const CATEGORY_LABELS: Record<WorkoutCategory, string> = {
  speediance: 'Speediance',
  bodyweight: 'Kropsvægt',
  mobility: 'Mobilitet',
};

/**
 * Resolve the workout chosen for today. The selection is only valid for the
 * date it was made on; a stale selection (from a previous day) resolves to
 * null so the user picks again.
 */
export function resolveTodaysWorkout(
  todaysWorkout: TodaysWorkout | null,
  workouts: Workout[],
  today: string,
): Workout | null {
  if (!todaysWorkout) return null;
  if (todaysWorkout.date !== today) return null;
  return workouts.find((w) => w.id === todaysWorkout.workoutId) ?? null;
}

/** A short summary like "30 min · 3 øvelser · Speediance". */
export function workoutSummary(workout: Workout): string {
  const count = workout.exercises.length;
  const exerciseLabel = count === 1 ? '1 øvelse' : `${count} øvelser`;
  return `${workout.estimatedMinutes} min · ${exerciseLabel} · ${CATEGORY_LABELS[workout.category]}`;
}

/** Human-friendly description of an exercise's dosage. */
export function exerciseDosage(exercise: {
  sets: number | null;
  reps: number | null;
  durationSeconds: number | null;
}): string {
  const parts: string[] = [];
  if (exercise.sets && exercise.reps) {
    parts.push(`${exercise.sets} × ${exercise.reps}`);
  } else if (exercise.reps) {
    parts.push(`${exercise.reps} gentagelser`);
  } else if (exercise.sets) {
    parts.push(`${exercise.sets} sæt`);
  }
  if (exercise.durationSeconds) {
    parts.push(`${exercise.durationSeconds} sek.`);
  }
  return parts.join(' · ');
}
