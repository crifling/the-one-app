import { describe, expect, it } from 'vitest';

import type { Workout } from '../../store/types';
import { resolveTodaysWorkout, workoutSummary, exerciseDosage } from './logic';

const workouts: Workout[] = [
  {
    id: 'w1',
    name: 'Ben + core',
    category: 'speediance',
    description: null,
    estimatedMinutes: 30,
    exercises: [
      { id: 'e1', name: 'Lunges', sets: 3, reps: 10, durationSeconds: null, restSeconds: 60, note: null },
    ],
  },
];

describe("today's workout selection", () => {
  it('resolves the workout chosen for today', () => {
    const result = resolveTodaysWorkout(
      { workoutId: 'w1', date: '2026-07-21' },
      workouts,
      '2026-07-21',
    );
    expect(result?.id).toBe('w1');
  });

  it('ignores a selection made on a previous day', () => {
    const result = resolveTodaysWorkout(
      { workoutId: 'w1', date: '2026-07-20' },
      workouts,
      '2026-07-21',
    );
    expect(result).toBeNull();
  });

  it('returns null when nothing is selected', () => {
    expect(resolveTodaysWorkout(null, workouts, '2026-07-21')).toBeNull();
  });

  it('returns null when the selected workout no longer exists', () => {
    const result = resolveTodaysWorkout(
      { workoutId: 'missing', date: '2026-07-21' },
      workouts,
      '2026-07-21',
    );
    expect(result).toBeNull();
  });

  it('summarises a workout', () => {
    expect(workoutSummary(workouts[0]!)).toBe('30 min · 1 øvelse · Speediance');
  });

  it('formats exercise dosage', () => {
    expect(exerciseDosage({ sets: 3, reps: 10, durationSeconds: null })).toBe('3 × 10');
    expect(exerciseDosage({ sets: null, reps: null, durationSeconds: 40 })).toBe('40 sek.');
  });
});
