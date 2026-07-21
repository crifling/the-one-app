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
    expect(m.programs).toHaveLength(2);
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
