import type { AppData, Task, Track, TrackAction } from './types';
import { focusTracks } from '../features/tracks/logic';

/**
 * General tasks live only in `tasks`. Track actions live only inside tracks.
 * These selectors make the separation explicit and are covered by tests.
 */
export function getGeneralTasks(data: Pick<AppData, 'tasks'>): Task[] {
  return data.tasks;
}

export function getAllTrackActions(
  data: Pick<AppData, 'tracks'>,
): TrackAction[] {
  return data.tracks.flatMap((t) => t.actions);
}

export function getFocusTracks(data: Pick<AppData, 'tracks'>): Track[] {
  return focusTracks(data.tracks);
}

export function getActiveTracks(data: Pick<AppData, 'tracks'>): Track[] {
  return data.tracks.filter((t) => t.status === 'active');
}

export function getTrackById(
  data: Pick<AppData, 'tracks'>,
  id: string,
): Track | undefined {
  return data.tracks.find((t) => t.id === id);
}

export function getNextAction(track: Track): TrackAction | undefined {
  if (!track.nextActionId) {
    return track.actions.find((a) => !a.completed);
  }
  return track.actions.find((a) => a.id === track.nextActionId);
}

/** Up to `limit` important, open general tasks (high priority first, then due). */
export function getImportantTasks(
  data: Pick<AppData, 'tasks'>,
  limit = 3,
): Task[] {
  const rank: Record<string, number> = { high: 0, normal: 1, low: 2 };
  return data.tasks
    .filter((t) => !t.completed)
    .sort((a, b) => {
      const byPriority = (rank[a.priority] ?? 1) - (rank[b.priority] ?? 1);
      if (byPriority !== 0) return byPriority;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    })
    .slice(0, limit);
}
