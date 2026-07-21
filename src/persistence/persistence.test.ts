import { describe, expect, it, vi, beforeEach } from 'vitest';

import { idbStorage } from './idbStorage';
import { useStore } from '../store/store';
import { emptyAppData } from '../store/defaults';

describe('idb storage adapter', () => {
  it('round-trips a value and removes it', async () => {
    await idbStorage.setItem('sample', 'hello');
    expect(await idbStorage.getItem('sample')).toBe('hello');
    await idbStorage.removeItem('sample');
    expect(await idbStorage.getItem('sample')).toBeNull();
  });

  it('returns null for unknown keys', async () => {
    expect(await idbStorage.getItem('does-not-exist')).toBeNull();
  });
});

describe('store persistence', () => {
  beforeEach(() => {
    // Reset to a clean, empty document before each test.
    useStore.setState({ ...emptyAppData() });
  });

  it('writes state changes through to IndexedDB', async () => {
    useStore.getState().addTask({ title: 'Persisted task', priority: 'high' });

    await vi.waitFor(async () => {
      const raw = await idbStorage.getItem('app-data');
      expect(raw).toBeTruthy();
      expect(raw).toContain('Persisted task');
    });

    // Simulate reopening the app: read the persisted document back.
    const raw = await idbStorage.getItem('app-data');
    const parsed = JSON.parse(raw as string);
    const persisted = parsed.state ?? parsed;
    const titles = persisted.tasks.map((t: { title: string }) => t.title);
    expect(titles).toContain('Persisted task');
  });

  it('seeds only when there is no user data', () => {
    useStore.setState({ ...emptyAppData(), seeded: false });
    useStore.getState().seedIfEmpty();
    const afterFirst = useStore.getState().tracks.length;
    expect(afterFirst).toBeGreaterThan(0);

    // Calling again must not duplicate or overwrite user data.
    useStore.getState().seedIfEmpty();
    expect(useStore.getState().tracks.length).toBe(afterFirst);
  });

  it('enforces the two-focus rule through the store', () => {
    useStore.setState({ ...emptyAppData() });
    const store = useStore.getState();
    const a = store.addTrack({ name: 'A', lifeArea: 'work', type: 'ongoing' });
    const b = store.addTrack({ name: 'B', lifeArea: 'work', type: 'ongoing' });
    const c = store.addTrack({ name: 'C', lifeArea: 'work', type: 'ongoing' });

    expect(useStore.getState().setTrackFocus(a, true).changed).toBe(true);
    expect(useStore.getState().setTrackFocus(b, true).changed).toBe(true);
    const third = useStore.getState().setTrackFocus(c, true);
    expect(third.changed).toBe(false);
    expect(third.error).toBeTruthy();

    const focused = useStore.getState().tracks.filter((t) => t.focus);
    expect(focused).toHaveLength(2);
  });
});
