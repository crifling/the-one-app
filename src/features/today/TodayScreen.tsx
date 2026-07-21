import { useState } from 'react';
import { Link } from 'react-router-dom';

import { TopBar } from '../../components/TopBar';
import { CheckRow } from '../../components/CheckRow';
import { useToast } from '../../components/ToastProvider';
import { useStore } from '../../store/store';
import {
  getFocusTracks,
  getImportantTasks,
  getNextAction,
} from '../../store/selectors';
import { todaysRoutines, routineCompletion } from '../routines/logic';
import { resolveTodaysWorkout, workoutSummary } from '../workouts/logic';
import { formatDayHeading, todayIso } from '../../lib/dates';
import { PriorityTag } from '../tasks/PriorityTag';
import { IdeaComposer } from '../tracks/IdeaComposer';

export function TodayScreen() {
  const store = useStore();
  const { showToast } = useToast();
  const today = todayIso();

  const routines = todaysRoutines(store.routines);
  const focus = getFocusTracks(store);
  const importantTasks = getImportantTasks(store, 3);
  const todaysWorkout = resolveTodaysWorkout(store.todaysWorkout, store.workouts, today);

  const [ideaFor, setIdeaFor] = useState<string | null>(null);

  return (
    <>
      <TopBar
        eyebrow={formatDayHeading()}
        title="Min Hverdag"
        showSettings
      />
      <main>
        <section className="hero">
          <small>Godmorgen, {store.settings.userName}</small>
          <strong>Fokus på det vigtigste.</strong>
          <div className="pills">
            <span className="pill">{focus.length} fokusspor</span>
            <span className="pill">{importantTasks.length} vigtige opgaver</span>
            {todaysWorkout && (
              <span className="pill">{todaysWorkout.estimatedMinutes} min. træning</span>
            )}
          </div>
        </section>

        {/* 1. Today's routines */}
        <section className="section">
          <div className="head">
            <h2>Dagens rutiner</h2>
            <Link className="link" to="/routines">
              Se alle
            </Link>
          </div>
          {routines.length === 0 && (
            <div className="card meta">Ingen daglige rutiner endnu.</div>
          )}
          {routines.map((routine) => {
            const { done, total } = routineCompletion(
              routine,
              store.routineProgress[routine.id],
              today,
            );
            return (
              <Link key={routine.id} className="card row tappable" to={`/routines/${routine.id}`}>
                <div className="icon">{routine.schedule === 'morning' ? '☀️' : '🌙'}</div>
                <div className="grow">
                  <h3>{routine.name}</h3>
                  <div className="meta">
                    {done} af {total} trin klaret i dag
                  </div>
                </div>
                <span className="chev" aria-hidden="true">
                  ›
                </span>
              </Link>
            );
          })}
        </section>

        {/* 2. Focus tracks */}
        <section className="section">
          <div className="head">
            <h2>Fokus nu</h2>
            <Link className="link" to="/tracks">
              Skift fokus
            </Link>
          </div>
          {focus.length === 0 && (
            <div className="card meta">
              Ingen fokusspor valgt. Vælg 1-2 spor at fokusere på under Spor.
            </div>
          )}
          {focus.map((track, index) => {
            const next = getNextAction(track);
            return (
              <div key={track.id} className="card focus">
                <div className="focushead">
                  <div className="num">{index + 1}</div>
                  <div className="grow">
                    <h3>{track.name}</h3>
                    <div className="meta">Fokusspor</div>
                  </div>
                </div>
                <div className="next">
                  <strong>Næste handling</strong>
                  {next ? next.title : 'Ingen næste handling endnu'}
                </div>
                <div className="actions">
                  <Link className="btn" to={`/tracks/${track.id}`}>
                    Åbn spor
                  </Link>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => setIdeaFor(ideaFor === track.id ? null : track.id)}
                  >
                    + Gem idé
                  </button>
                </div>
                {ideaFor === track.id && (
                  <div style={{ marginTop: 10 }}>
                    <IdeaComposer
                      onSubmit={(text) => {
                        store.addIdea(track.id, text);
                        setIdeaFor(null);
                        showToast('Idé gemt på sporet.');
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* 3. Important general tasks */}
        <section className="section">
          <div className="head">
            <h2>Vigtigste opgaver</h2>
            <Link className="link" to="/tasks">
              Se alle
            </Link>
          </div>
          {importantTasks.length === 0 && (
            <div className="card meta">Ingen åbne opgaver. Godt gået.</div>
          )}
          {importantTasks.map((task) => (
            <CheckRow
              key={task.id}
              checked={task.completed}
              onToggle={() => store.toggleTask(task.id)}
              title={task.title}
              meta="Generel opgave"
              tag={task.priority === 'high' ? <PriorityTag priority="high" /> : undefined}
            />
          ))}
        </section>

        {/* 4. Today's workout */}
        <section className="section">
          <div className="head">
            <h2>Dagens træning</h2>
            <Link className="link" to="/workouts">
              Bibliotek
            </Link>
          </div>
          {todaysWorkout ? (
            <div className="card">
              <div className="row">
                <div className="workart" aria-hidden="true">
                  🏋️
                </div>
                <div className="grow">
                  <h3>{todaysWorkout.name}</h3>
                  <div className="meta">{workoutSummary(todaysWorkout)}</div>
                </div>
              </div>
              <div className="actions" style={{ marginTop: 12 }}>
                <Link className="btn primary" to={`/workouts/${todaysWorkout.id}/play`}>
                  Start træning
                </Link>
                <Link className="btn" to="/workouts">
                  Skift
                </Link>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="meta" style={{ marginTop: 0, marginBottom: 12 }}>
                Ingen træning valgt til i dag.
              </div>
              <Link className="btn primary block" to="/workouts">
                Vælg træning
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
