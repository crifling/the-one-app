import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { TopBar } from '../../components/TopBar';
import { CheckRow } from '../../components/CheckRow';
import { useToast } from '../../components/ToastProvider';
import { useStore } from '../../store/store';
import { getTrackById } from '../../store/selectors';
import type { TrackStatus } from '../../store/types';
import { lifeAreaName } from '../../data/lifeAreas';
import { areaClass, areaEmoji } from './areaVisuals';
import { IdeaComposer } from './IdeaComposer';

const STATUS_LABELS: Record<TrackStatus, string> = {
  active: 'Aktivt',
  paused: 'På pause',
  archived: 'Arkiveret',
};

export function TrackDetailScreen() {
  const { trackId = '' } = useParams();
  const store = useStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const track = getTrackById(store, trackId);
  const [newAction, setNewAction] = useState('');

  if (!track) {
    return (
      <>
        <TopBar title="Spor" back="/tracks" />
        <main>
          <div className="empty">Sporet blev ikke fundet.</div>
        </main>
      </>
    );
  }

  function toggleFocus() {
    if (!track) return;
    const result = store.setTrackFocus(track.id, !track.focus);
    if (result.error) {
      showToast(result.error, 'error');
    } else if (result.changed) {
      showToast(track.focus ? 'Fjernet fra fokus.' : 'Sat som fokusspor.');
    }
  }

  function addAction() {
    const trimmed = newAction.trim();
    if (!trimmed || !track) return;
    store.addTrackAction(track.id, trimmed);
    setNewAction('');
  }

  return (
    <>
      <TopBar eyebrow={lifeAreaName(track.lifeArea)} title={track.name} back="/tracks" />
      <main>
        <div className="detail">
          <div className="row">
            <div className={`icon ${areaClass(track.lifeArea)}`} aria-hidden="true">
              {areaEmoji(track.lifeArea)}
            </div>
            <div className="grow">
              <div className="eyebrow">
                {track.type === 'completable' ? 'Afslutteligt spor' : 'Løbende spor'}
              </div>
              <h2 className="detailtitle">{track.name}</h2>
              <div className="meta">
                {lifeAreaName(track.lifeArea)} · {STATUS_LABELS[track.status]}
              </div>
            </div>
          </div>
          <div className="actions" style={{ marginTop: 14 }}>
            <button
              type="button"
              className={`btn${track.focus ? '' : ' primary'}`}
              onClick={toggleFocus}
              aria-pressed={track.focus}
            >
              {track.focus ? 'Fjern fokus' : 'Sæt i fokus'}
            </button>
            <select
              className="select"
              value={track.status}
              aria-label="Status"
              onChange={(e) =>
                store.updateTrack(track.id, { status: e.target.value as TrackStatus })
              }
            >
              <option value="active">Aktivt</option>
              <option value="paused">På pause</option>
              <option value="archived">Arkiveret</option>
            </select>
          </div>
        </div>

        <div className="label">Handlinger</div>
        {track.actions.length === 0 && (
          <div className="card meta">Ingen handlinger endnu.</div>
        )}
        {track.actions.map((action) => (
          <CheckRow
            key={action.id}
            checked={action.completed}
            onToggle={() => store.toggleTrackAction(track.id, action.id)}
            title={action.title}
            tag={
              track.nextActionId === action.id ? (
                <span className="tag blue">Næste</span>
              ) : undefined
            }
            trailing={
              <div className="row" style={{ gap: 0 }}>
                <button
                  type="button"
                  className="iconbtn"
                  aria-label={`Marker "${action.title}" som næste handling`}
                  onClick={() =>
                    store.setNextAction(
                      track.id,
                      track.nextActionId === action.id ? null : action.id,
                    )
                  }
                >
                  ☆
                </button>
                <button
                  type="button"
                  className="iconbtn"
                  aria-label={`Slet ${action.title}`}
                  onClick={() => store.deleteTrackAction(track.id, action.id)}
                >
                  🗑
                </button>
              </div>
            }
          />
        ))}

        <div className="card" style={{ marginTop: 4 }}>
          <label className="field" style={{ marginBottom: 8 }}>
            <span>Ny handling</span>
            <input
              className="input"
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="Næste konkrete skridt"
              onKeyDown={(e) => {
                if (e.key === 'Enter') addAction();
              }}
            />
          </label>
          <button
            type="button"
            className="btn primary block"
            onClick={addAction}
            disabled={!newAction.trim()}
          >
            Tilføj handling
          </button>
        </div>

        <div className="label">Ideer og noter</div>
        {track.ideas.map((idea) => (
          <div key={idea.id} className="card idea">
            <span className="grow">{idea.text}</span>
            <button
              type="button"
              className="iconbtn"
              aria-label="Slet idé"
              onClick={() => store.deleteIdea(track.id, idea.id)}
            >
              🗑
            </button>
          </div>
        ))}
        <div style={{ marginTop: 4 }}>
          <IdeaComposer onSubmit={(text) => store.addIdea(track.id, text)} />
        </div>

        <div className="label">Farezone</div>
        <button
          type="button"
          className="btn danger block"
          onClick={() => {
            if (confirm(`Slet sporet "${track.name}"? Handlingen kan ikke fortrydes.`)) {
              store.deleteTrack(track.id);
              navigate('/tracks');
            }
          }}
        >
          Slet spor
        </button>
      </main>
    </>
  );
}
