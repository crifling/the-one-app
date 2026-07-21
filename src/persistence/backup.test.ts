import { describe, expect, it } from 'vitest';

import { CURRENT_VERSION } from '../store/defaults';
import { seedData } from '../data/seed';
import { exportData, validateBackup } from './backup';

describe('backup import validation', () => {
  it('accepts a freshly exported backup and round-trips it', () => {
    const data = seedData();
    const json = exportData(data);
    const result = validateBackup(json);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.migrated).toBe(false);
      expect(result.data.tracks).toHaveLength(data.tracks.length);
      expect(result.data.version).toBe(CURRENT_VERSION);
    }
  });

  it('rejects invalid JSON', () => {
    const result = validateBackup('{ not valid json');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/JSON/i);
  });

  it('rejects a JSON array', () => {
    const result = validateBackup('[]');
    expect(result.ok).toBe(false);
  });

  it('rejects a document without a numeric version', () => {
    const result = validateBackup(JSON.stringify({ tracks: [] }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/version/i);
  });

  it('rejects a document from a newer, unsupported version', () => {
    const result = validateBackup(
      JSON.stringify({ version: CURRENT_VERSION + 5, tracks: [] }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/nyere version/i);
  });

  it('rejects a document where a required field has the wrong type', () => {
    const result = validateBackup(
      JSON.stringify({ version: CURRENT_VERSION, tracks: 'nope' }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/liste/i);
  });

  it('migrates an older backup on import', () => {
    const legacy = { version: 0, tasks: [{ id: 't1' }] };
    const result = validateBackup(JSON.stringify(legacy));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.migrated).toBe(true);
      expect(result.sourceVersion).toBe(0);
      expect(result.data.version).toBe(CURRENT_VERSION);
      // Missing collections are filled in with defaults.
      expect(Array.isArray(result.data.tracks)).toBe(true);
      expect(Array.isArray(result.data.workouts)).toBe(true);
    }
  });
});
