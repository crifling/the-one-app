import { useState } from 'react';
import { Link } from 'react-router-dom';

import { TopBar } from '../../components/TopBar';
import { useStore } from '../../store/store';
import type { RoutineSchedule } from '../../store/types';
import { routineCompletion, SCHEDULE_ICONS, SCHEDULE_LABELS } from './logic';
import { todayIso } from '../../lib/dates';

export function RoutinesScreen() {
  const store = useStore();
  const today = todayIso();
  const [newName, setNewName] = useState('');
  const [schedule, setSchedule] = useState<RoutineSchedule>('morning');
  const [adding, setAdding] = useState(false);

  function addRoutine() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const id = store.addRoutine(trimmed, schedule);
    setNewName('');
    setAdding(false);
    return id;
  }

  return (
    <>
      <TopBar eyebrow="Genbrugelige tjeklister" title="Rutiner" showSettings />
      <main>
        {!adding && (
          <button
            type="button"
            className="btn primary block"
            onClick={() => setAdding(true)}
            style={{ marginBottom: 14 }}
          >
            + Ny rutine
          </button>
        )}
        {adding && (
          <div className="card">
            <label className="field">
              <span>Navn</span>
              <input
                className="input"
                value={newName}
                autoFocus
                onChange={(e) => setNewName(e.target.value)}
                placeholder="F.eks. Morgenrutine"
              />
            </label>
            <label className="field">
              <span>Hvornår</span>
              <select
                className="select"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value as RoutineSchedule)}
              >
                <option value="morning">Morgen (daglig)</option>
                <option value="evening">Aften (daglig)</option>
                <option value="weekly">Ugentlig</option>
                <option value="reusable">Genbrugelig liste</option>
              </select>
            </label>
            <div className="actions">
              <button type="button" className="btn" onClick={() => setAdding(false)}>
                Annullér
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={addRoutine}
                disabled={!newName.trim()}
              >
                Opret
              </button>
            </div>
          </div>
        )}

        {store.routines.length === 0 && (
          <div className="empty">Ingen rutiner endnu.</div>
        )}

        {store.routines.map((routine) => {
          const { done, total } = routineCompletion(
            routine,
            store.routineProgress[routine.id],
            today,
          );
          const daily = routine.schedule === 'morning' || routine.schedule === 'evening';
          return (
            <Link key={routine.id} className="card row tappable" to={`/routines/${routine.id}`}>
              <div className="icon" aria-hidden="true">
                {SCHEDULE_ICONS[routine.schedule]}
              </div>
              <div className="grow">
                <h3>{routine.name}</h3>
                <div className="meta">
                  {total} trin · {SCHEDULE_LABELS[routine.schedule]}
                  {daily && total > 0 ? ` · ${done}/${total} i dag` : ''}
                </div>
              </div>
              <span className="chev" aria-hidden="true">
                ›
              </span>
            </Link>
          );
        })}
      </main>
    </>
  );
}
