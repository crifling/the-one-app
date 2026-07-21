import type { Track } from '../../store/types';

/** Product rule: no more than two tracks may be current focus tracks. */
export const MAX_FOCUS_TRACKS = 2;

export function focusTracks(tracks: Track[]): Track[] {
  return tracks.filter((t) => t.focus && t.status === 'active');
}

export function countFocus(tracks: Track[]): number {
  return tracks.filter((t) => t.focus).length;
}

/**
 * Whether a track may be turned into a focus track given the current set.
 * A track that is already focus can always stay focus.
 */
export function canSetFocus(tracks: Track[], trackId: string): boolean {
  const target = tracks.find((t) => t.id === trackId);
  if (target?.focus) return true;
  return countFocus(tracks) < MAX_FOCUS_TRACKS;
}

export interface SetFocusResult {
  tracks: Track[];
  changed: boolean;
  /** Present when the change was rejected. */
  error?: string;
}

/**
 * Return a new tracks array with `trackId`'s focus set to `focus`, enforcing
 * the max-two rule. When the limit would be exceeded the change is rejected and
 * the original array is returned unchanged with an `error`.
 */
export function setTrackFocus(
  tracks: Track[],
  trackId: string,
  focus: boolean,
  now: string,
): SetFocusResult {
  const target = tracks.find((t) => t.id === trackId);
  if (!target) {
    return { tracks, changed: false, error: 'Sporet findes ikke.' };
  }
  if (target.focus === focus) {
    return { tracks, changed: false };
  }
  if (focus && countFocus(tracks) >= MAX_FOCUS_TRACKS) {
    return {
      tracks,
      changed: false,
      error: `Du kan højst have ${MAX_FOCUS_TRACKS} fokusspor ad gangen.`,
    };
  }
  const next = tracks.map((t) =>
    t.id === trackId ? { ...t, focus, updatedAt: now } : t,
  );
  return { tracks: next, changed: true };
}
