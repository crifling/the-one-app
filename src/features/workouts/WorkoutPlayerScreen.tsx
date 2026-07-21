import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useToast } from '../../components/ToastProvider';
import { useStore } from '../../store/store';
import { exerciseDosage } from './logic';

const CATEGORY_EMOJI: Record<string, string> = {
  speediance: '🏋️',
  bodyweight: '💪',
  mobility: '🧘',
};

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function WorkoutPlayerScreen() {
  const { workoutId = '' } = useParams();
  const store = useStore();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const workout = store.workouts.find((w) => w.id === workoutId);
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);

  // Simple count-up stopwatch for the current exercise.
  useEffect(() => {
    setElapsed(0);
  }, [index]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running, index]);

  if (!workout || workout.exercises.length === 0) {
    return (
      <main>
        <div className="empty">Træningen kunne ikke startes.</div>
        <button type="button" className="btn primary block" onClick={() => navigate('/workouts')}>
          Tilbage til bibliotek
        </button>
      </main>
    );
  }

  const total = workout.exercises.length;
  const exercise = workout.exercises[index]!;
  const isLast = index === total - 1;

  function finish() {
    if (!workout) return;
    store.completeWorkout(workout.id, total);
    showToast('Træning gennemført. Godt gået!');
    navigate('/today');
  }

  return (
    <main>
      <div className="player" aria-hidden="true">
        {CATEGORY_EMOJI[workout.category] ?? '🏋️'}
      </div>
      <div className="center">
        <div className="counter">
          Øvelse {index + 1} af {total}
        </div>
        <div className="exercise">{exercise.name}</div>
        <div className="meta" style={{ fontSize: 16 }}>
          {exerciseDosage(exercise)}
          {exercise.note ? ` · ${exercise.note}` : ''}
        </div>
        <div
          className="timer"
          style={{ fontSize: 48, fontWeight: 850, margin: '18px 0' }}
          aria-live="off"
        >
          {formatClock(elapsed)}
        </div>
        <button
          type="button"
          className="btn block"
          onClick={() => setRunning((r) => !r)}
          aria-pressed={!running}
        >
          {running ? 'Pause' : 'Fortsæt'}
        </button>
      </div>

      <div className="playeractions">
        <button
          type="button"
          className="btn"
          onClick={() => (index === 0 ? navigate('/today') : setIndex((i) => i - 1))}
        >
          {index === 0 ? 'Afslut' : 'Tilbage'}
        </button>
        {isLast ? (
          <button type="button" className="btn primary" onClick={finish}>
            Gennemfør
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={() => setIndex((i) => i + 1)}>
            Næste
          </button>
        )}
      </div>
    </main>
  );
}
