import { describe, expect, it } from 'vitest';

import { seedData } from '../data/seed';
import {
  getAllTrackActions,
  getGeneralTasks,
  getImportantTasks,
} from './selectors';

describe('track actions vs general tasks separation', () => {
  it('track actions never appear in the general task list', () => {
    const data = seedData();
    const generalTasks = getGeneralTasks(data);
    const trackActions = getAllTrackActions(data);

    expect(trackActions.length).toBeGreaterThan(0);
    expect(generalTasks.length).toBeGreaterThan(0);

    const taskIds = new Set(generalTasks.map((t) => t.id));
    const taskTitles = new Set(generalTasks.map((t) => t.title));

    for (const action of trackActions) {
      expect(taskIds.has(action.id)).toBe(false);
      expect(taskTitles.has(action.title)).toBe(false);
    }
  });

  it('general tasks are not stored on any track', () => {
    const data = seedData();
    const generalTaskIds = new Set(getGeneralTasks(data).map((t) => t.id));
    for (const track of data.tracks) {
      for (const action of track.actions) {
        expect(generalTaskIds.has(action.id)).toBe(false);
      }
    }
  });

  it('important tasks are limited, open and ranked by priority', () => {
    const data = seedData();
    const important = getImportantTasks(data, 3);
    expect(important.length).toBeLessThanOrEqual(3);
    expect(important.every((t) => !t.completed)).toBe(true);
    // The high-priority task should come first.
    expect(important[0]?.priority).toBe('high');
  });
});
