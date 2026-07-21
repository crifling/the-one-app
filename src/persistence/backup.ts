import type { AppData } from '../store/types';
import { CURRENT_VERSION } from '../store/defaults';
import { runMigrations } from './migrations';

/**
 * Backup format = the AppData document itself. The `version` field lets future
 * versions migrate older backups on import.
 */

export interface BackupValidationOk {
  ok: true;
  data: AppData;
  /** True when the backup came from an older schema and was migrated. */
  migrated: boolean;
  sourceVersion: number;
}

export interface BackupValidationError {
  ok: false;
  error: string;
}

export type BackupValidation = BackupValidationOk | BackupValidationError;

/** Serialise the current app document to a pretty JSON string. */
export function exportData(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

/** A filename incorporating the date, for downloaded backups. */
export function backupFilename(isoDate: string): string {
  return `min-hverdag-backup-${isoDate}.json`;
}

const REQUIRED_ARRAY_FIELDS = [
  'tracks',
  'tasks',
  'routines',
  'workouts',
  'workoutHistory',
] as const;

/**
 * Validate an untrusted JSON string as a backup. On success the data is
 * migrated to the current schema version. This is intentionally strict enough
 * to reject obviously wrong files but tolerant of older/partial documents so
 * that migrations can fix them.
 */
export function validateBackup(json: string): BackupValidation {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: 'Filen er ikke gyldig JSON.' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'Backuppen har ikke det forventede format.' };
  }

  const obj = parsed as Record<string, unknown>;

  if (!('version' in obj) || typeof obj.version !== 'number') {
    return {
      ok: false,
      error: 'Backuppen mangler et gyldigt versionsnummer.',
    };
  }

  if (obj.version > CURRENT_VERSION) {
    return {
      ok: false,
      error: `Backuppen er fra en nyere version (${obj.version}) end appen understøtter (${CURRENT_VERSION}).`,
    };
  }

  for (const field of REQUIRED_ARRAY_FIELDS) {
    if (field in obj && !Array.isArray(obj[field])) {
      return {
        ok: false,
        error: `Feltet "${field}" skal være en liste.`,
      };
    }
  }

  const sourceVersion = obj.version;
  const data = runMigrations(obj);

  return {
    ok: true,
    data,
    migrated: sourceVersion < CURRENT_VERSION,
    sourceVersion,
  };
}
