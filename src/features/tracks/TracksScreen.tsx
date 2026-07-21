import { useState } from 'react';
import { Link } from 'react-router-dom';

import { TopBar } from '../../components/TopBar';
import { useStore } from '../../store/store';
import { getActiveTracks, getFocusTracks, getNextAction } from '../../store/selectors';
import { lifeAreaName } from '../../data/lifeAreas';
import { areaClass, areaEmoji } from './areaVisuals';
import { TrackForm, type TrackFormValue } from './TrackForm';
import type { Track } from '../../store/types';

function TrackCard({ track, badge }: { track: Track; badge?: string }) {
  const next = getNextAction(track);
  return (
    <Link className="card row tappable" to={`/tracks/${track.id}`}>
      <div className={`icon ${areaClass(track.lifeArea)}`} aria-hidden="true">
        {areaEmoji(track.lifeArea)}
      </div>
      <div className="grow">
        <h3>{track.name}</h3>
        <div className="meta">
          {lifeAreaName(track.lifeArea)}
          {next ? ` · Næste: ${next.title}` : ' · Ingen næste handling'}
        </div>
      </div>
      {badge && <span className="tag blue">{badge}</span>}
      <span className="chev" aria-hidden="true">
        ›
      </span>
    </Link>
  );
}

export function TracksScreen() {
  const store = useStore();
  const [creating, setCreating] = useState(false);

  const focus = getFocusTracks(store);
  const active = getActiveTracks(store);
  const others = active.filter((t) => !t.focus);
  const paused = store.tracks.filter((t) => t.status !== 'active');

  function handleCreate(value: TrackFormValue) {
    store.addTrack(value);
    setCreating(false);
  }

  return (
    <>
      <TopBar eyebrow="Livsområder" title="Spor" showSettings />
      <main>
        <div className="callout">
          Spor kan være personer, relationer, mål, ansvar, hobbyer eller
          konkrete projekter. Kun ét eller to er i fokus ad gangen.
        </div>

        {!creating && (
          <button
            type="button"
            className="btn primary block"
            onClick={() => setCreating(true)}
            style={{ marginBottom: 14 }}
          >
            + Nyt spor
          </button>
        )}
        {creating && (
          <TrackForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        )}

        <div className="label">Fokus nu</div>
        {focus.length === 0 && (
          <div className="card meta">Ingen fokusspor valgt endnu.</div>
        )}
        {focus.map((track, i) => (
          <TrackCard key={track.id} track={track} badge={`Fokus ${i + 1}`} />
        ))}

        <div className="label">Andre aktive spor</div>
        {others.length === 0 && (
          <div className="card meta">Ingen andre aktive spor.</div>
        )}
        {others.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}

        {paused.length > 0 && (
          <>
            <div className="label">Sat på pause / arkiveret</div>
            {paused.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </>
        )}
      </main>
    </>
  );
}
