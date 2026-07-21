import type { Routine, RoutineProgress, RoutineSchedule } from '../../store/types';

export const SCHEDULE_LABELS: Record<RoutineSchedule, string> = {
  morning: 'Morgen',
  evening: 'Aften',
  weekly: 'Ugentlig',
  reusable: 'Genbrugelig',
};

export const SCHEDULE_ICONS: Record<RoutineSchedule, string> = {
  morning: '☀️',
  evening: '🌙',
  weekly: '↻',
  reusable: '🧳',
};

/** Routines shown on the Today screen: the daily morning & evening ones. */
export function todaysRoutines(routines: Routine[]): Routine[] {
  const order: Record<string, number> = { morning: 0, evening: 1 };
  return routines
    .filter((r) => r.schedule === 'morning' || r.schedule === 'evening')
    .sort((a, b) => (order[a.schedule] ?? 9) - (order[b.schedule] ?? 9));
}

/**
 * Read the completed step ids for a routine on a given day. Progress from a
 * previous day is treated as empty (routines reset each day).
 */
export function completedStepsForToday(
  progress: RoutineProgress | undefined,
  today: string,
): string[] {
  if (!progress || progress.date !== today) return [];
  return progress.completedStepIds;
}

/** Toggle a step's completion for today, returning fresh progress. */
export function toggleRoutineStep(
  progress: RoutineProgress | undefined,
  today: string,
  stepId: string,
): RoutineProgress {
  const current = completedStepsForToday(progress, today);
  const has = current.includes(stepId);
  const completedStepIds = has
    ? current.filter((id) => id !== stepId)
    : [...current, stepId];
  return { date: today, completedStepIds };
}

/** How many steps of a routine are done today, as a fraction 0..1. */
export function routineCompletion(
  routine: Routine,
  progress: RoutineProgress | undefined,
  today: string,
): { done: number; total: number } {
  const done = completedStepsForToday(progress, today).filter((id) =>
    routine.steps.some((s) => s.id === id),
  ).length;
  return { done, total: routine.steps.length };
}
