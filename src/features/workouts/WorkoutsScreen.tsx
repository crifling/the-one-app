import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { TopBar } from '../../components/TopBar';
import { useStore } from '../../store/store';
import type { WorkoutCategory } from '../../store/types';
import { todayIso } from '../../lib/dates';
import { resolveTodaysWorkout, workoutSummary } from './logic';

type Filter = 'all' | WorkoutCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'speediance', label: 'Speediance' },
  { id: 'bodyweight', label: 'Kropsvægt' },
  { id: 'mobility', label: 'Mobilitet' },
];

const CATEGORY_EMOJI: Record<WorkoutCategory, string> = {
  speediance: '🏋️',
  bodyweight: '💪',
  mobility: '🧘',
};

export function WorkoutsScreen() {
  const store = useStore();
  const today = todayIso();
  const [filter, setFilter] = useState<Filter>('all');

  const todays = resolveTodaysWorkout(store.todaysWorkout, store.workouts, today);

  const visible = useMemo(
    () =>
      store.workouts.filter((w) => filter === 'all' || w.category === filter),
    [store.workouts, filter],
  );

  const recentHistory = store.workoutHistory.slice(0, 5);

  return (
    <>
      <TopBar eyebrow="Bibliotek" title="Træning" showSettings />
      <main>
        <div className="filters" role="tablist" aria-label="Filtrér træning">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={`filter${filter === f.id ? ' active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {visible.map((workout) => (
          <Link key={workout.id} className="card row tappable" to={`/workouts/${workout.id}`}>
            <div className="workart" aria-hidden="true">
              {CATEGORY_EMOJI[workout.category]}
            </div>
            <div className="grow">
              <h3>{workout.name}</h3>
              <div className="meta">{workoutSummary(workout)}</div>
              {todays?.id === workout.id && (
                <div style={{ marginTop: 7 }}>
                  <span className="tag">Valgt i dag</span>
                </div>
              )}
            </div>
            <span className="chev" aria-hidden="true">
              ›
            </span>
          </Link>
        ))}

        {visible.length === 0 && <div className="empty">Ingen træning her.</div>}

        {recentHistory.length > 0 && (
          <>
            <div className="label">Seneste træning</div>
            {recentHistory.map((session) => (
              <div key={session.id} className="card">
                <div className="row">
                  <div className="grow">
                    <h3>{session.workoutName}</h3>
                    <div className="meta">
                      {new Date(session.completedAt).toLocaleDateString('da-DK', {
                        day: 'numeric',
                        month: 'long',
                      })}{' '}
                      · {session.exercisesCompleted}/{session.exercisesTotal} øvelser
                    </div>
                  </div>
                  <span className="tag">Fuldført</span>
                </div>
              </div>
            ))}
          </>
        )}
      </main>
    </>
  );
}
