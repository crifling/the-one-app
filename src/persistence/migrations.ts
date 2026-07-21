import type { AppData } from '../store/types';
import { CURRENT_VERSION, emptyAppData } from '../store/defaults';

/**
 * Migration framework.
 *
 * Each migration upgrades a document from version N to N+1. They are applied
 * in sequence, so an old document of any version is brought up to
 * CURRENT_VERSION one step at a time. Adding a future migration is just adding
 * an entry to `MIGRATIONS`.
 *
 * Version 0 represents any legacy/unknown document (e.g. a pre-versioning
 * export or a backup missing fields). Migration 0 -> 1 fills in defaults.
 */

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

export const MIGRATIONS: Record<number, Migration> = {
  // 0 -> 1: establish the baseline shape, filling any missing collections.
  0: (data) => {
    const base = emptyAppData() as unknown as Record<string, unknown>;
    return {
      ...base,
      ...data,
      version: 1,
      // Ensure life areas are always the current built-in set.
      lifeAreas: base.lifeAreas,
    };
  },
};

/**
 * Bring a persisted document (of any version) up to CURRENT_VERSION.
 * Unknown/missing version is treated as 0.
 */
export function runMigrations(input: unknown): AppData {
  let data =
    input && typeof input === 'object'
      ? { ...(input as Record<string, unknown>) }
      : {};

  let version = typeof data.version === 'number' ? data.version : 0;

  while (version < CURRENT_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) {
      // No migration defined for this step: fail safe to defaults merged with
      // whatever we have, then stop.
      data = { ...(emptyAppData() as unknown as Record<string, unknown>), ...data };
      break;
    }
    data = migrate(data);
    version = typeof data.version === 'number' ? data.version : version + 1;
  }

  // Documents newer than we understand are used as-is but stamped down to the
  // version we know, so the app keeps working (best effort).
  data.version = CURRENT_VERSION;
  return data as unknown as AppData;
}
