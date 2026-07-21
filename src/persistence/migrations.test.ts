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
    expect(Array.isArray(migrated.workouts)).toBe(true);
    expect(Array.isArray(migrated.workoutHistory)).toBe(true);
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
