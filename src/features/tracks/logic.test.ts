import { describe, expect, it } from 'vitest';

import type { Track } from '../../store/types';
import {
  MAX_FOCUS_TRACKS,
  canSetFocus,
  countFocus,
  focusTracks,
  setTrackFocus,
} from './logic';

const NOW = '2026-07-21T10:00:00.000Z';

function track(id: string, focus = false, status: Track['status'] = 'active'): Track {
  return {
    id,
    name: id,
    lifeArea: 'work',
    type: 'ongoing',
    status,
    focus,
    nextActionId: null,
    actions: [],
    ideas: [],
    createdAt: NOW,
    updatedAt: NOW,
  };
}

describe('focus track rule (max two)', () => {
  it('allows setting focus when fewer than two tracks are focused', () => {
    const tracks = [track('a', true), track('b'), track('c')];
    const result = setTrackFocus(tracks, 'b', true, NOW);
    expect(result.changed).toBe(true);
    expect(result.error).toBeUndefined();
    expect(countFocus(result.tracks)).toBe(2);
  });

  it('rejects a third focus track', () => {
    const tracks = [track('a', true), track('b', true), track('c')];
    const result = setTrackFocus(tracks, 'c', true, NOW);
    expect(result.changed).toBe(false);
    expect(result.error).toContain(String(MAX_FOCUS_TRACKS));
    // Original tracks are returned unchanged.
    expect(countFocus(result.tracks)).toBe(2);
    expect(result.tracks.find((t) => t.id === 'c')?.focus).toBe(false);
  });

  it('always allows unfocusing, even at the limit', () => {
    const tracks = [track('a', true), track('b', true)];
    const result = setTrackFocus(tracks, 'a', false, NOW);
    expect(result.changed).toBe(true);
    expect(countFocus(result.tracks)).toBe(1);
  });

  it('lets an already-focused track stay focused when re-set', () => {
    const tracks = [track('a', true), track('b', true)];
    expect(canSetFocus(tracks, 'a')).toBe(true);
    expect(canSetFocus(tracks, 'nonfocus-that-does-not-exist')).toBe(false);
  });

  it('never lets more than two tracks be focused across repeated calls', () => {
    let tracks = [track('a'), track('b'), track('c'), track('d')];
    for (const id of ['a', 'b', 'c', 'd']) {
      tracks = setTrackFocus(tracks, id, true, NOW).tracks;
    }
    expect(countFocus(tracks)).toBe(MAX_FOCUS_TRACKS);
  });

  it('focusTracks ignores non-active tracks', () => {
    const tracks = [track('a', true), track('b', true, 'paused')];
    expect(focusTracks(tracks).map((t) => t.id)).toEqual(['a']);
  });
});
