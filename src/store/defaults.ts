import type { AppData } from './types';
import { LIFE_AREAS } from '../data/lifeAreas';

/** Current schema version of the persisted document. */
export const CURRENT_VERSION = 4;

/** An empty document at the current schema version (no seed data). */
export function emptyAppData(): AppData {
  return {
    version: CURRENT_VERSION,
    lifeAreas: LIFE_AREAS,
    tracks: [],
    tasks: [],
    routines: [],
    routineProgress: {},
    exercises: [],
    programs: [],
    sessions: [],
    todaysProgram: null,
    settings: { userName: 'Claus' },
    seeded: false,
  };
}
