import { useNavigate, useParams } from 'react-router-dom';

import { TopBar } from '../../components/TopBar';
import { useToast } from '../../components/ToastProvider';
import { useStore } from '../../store/store';
import { todayIso } from '../../lib/dates';
import { CATEGORY_LABELS, exerciseDosage, resolveTodaysWorkout } from './logic';

export function WorkoutDetailScreen() {
  const { workoutId = '' } = useParams();
  const store = useStore();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const today = todayIso();

  const workout = store.workouts.find((w) => w.id === workoutId);
  const todays = resolveTodaysWorkout(store.todaysWorkout, store.workouts, today);

  if (!workout) {
    return (
      <>
        <TopBar title="Træning" back="/workouts" />
        <main>
          <div className="empty">Træningen blev ikke fundet.</div>
        </main>
      </>
    );
  }

  const isToday = todays?.id === workout.id;

  return (
    <>
      <TopBar eyebrow={CATEGORY_LABELS[workout.category]} title={workout.name} back="/workouts" />
      <main>
        <div className="detail">
          <div className="eyebrow">{CATEGORY_LABELS[workout.category]}</div>
          <h2 className="detailtitle">{workout.name}</h2>
          <div className="meta">
            {workout.estimatedMinutes} min · {workout.exercises.length} øvelser
          </div>
          {workout.description && (
            <div className="meta" style={{ marginTop: 8, fontSize: 14 }}>
              {workout.description}
            </div>
          )}
        </div>

        <div className="label">Øvelser</div>
        {workout.exercises.map((exercise) => (
          <div key={exercise.id} className="card">
            <h3>{exercise.name}</h3>
            <div className="meta">
              {exerciseDosage(exercise)}
              {exercise.note ? ` · ${exercise.note}` : ''}
              {exercise.restSeconds ? ` · ${exercise.restSeconds} sek. pause` : ''}
            </div>
          </div>
        ))}

        <div className="actions" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="btn"
            onClick={() => {
              store.setTodaysWorkout(workout.id);
              showToast('Valgt som dagens træning.');
            }}
            disabled={isToday}
          >
            {isToday ? 'Valgt i dag' : 'Vælg til i dag'}
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              store.setTodaysWorkout(workout.id);
              navigate(`/workouts/${workout.id}/play`);
            }}
          >
            Start træning
          </button>
        </div>
      </main>
    </>
  );
}
