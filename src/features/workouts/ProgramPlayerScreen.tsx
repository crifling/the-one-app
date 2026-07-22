import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useToast } from '../../components/ToastProvider';
import { useStore } from '../../store/store';
import type { ExerciseStep } from '../../store/types';
import {
  CATEGORY_EMOJI,
  categorySupportsWeight,
  exerciseById,
} from './logic';

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ProgramPlayerScreen() {
  const { programId = '' } = useParams();
  const store = useStore();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const program = store.programs.find((p) => p.id === programId);

  const [index, setIndex] = useState(0);
  const [setNo, setSetNo] = useState(1);
  const [resting, setResting] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [finished, setFinished] = useState(false);

  const step = program?.steps[index];
  const isRestView = step?.kind === 'pause' || resting;

  // Drive the countdown for pause steps and between-set rests.
  useEffect(() => {
    if (finished || !isRestView) return;
    if (remaining <= 0) {
      advanceAfterRest();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, isRestView, finished]);

  if (!program || program.steps.filter((s) => s.kind === 'exercise').length === 0) {
    return (
      <main>
        <div className="empty">Programmet kunne ikke startes.</div>
        <button type="button" className="btn primary block" onClick={() => navigate('/workouts')}>
          Tilbage til Træning
        </button>
      </main>
    );
  }

  const exerciseTotal = program.steps.filter((s) => s.kind === 'exercise').length;
  const exerciseNumber = program.steps
    .slice(0, index + 1)
    .filter((s) => s.kind === 'exercise').length;

  function startRest(seconds: number) {
    setRemaining(seconds);
    setResting(true);
  }

  function advanceAfterRest() {
    if (!program) return;
    if (resting) {
      // rest between sets finished → next set of the same exercise
      setResting(false);
      setSetNo((n) => n + 1);
    } else {
      // standalone pause step finished → next step
      setResting(false);
      setIndex((i) => i + 1);
    }
  }

  function completeSet(exStep: ExerciseStep) {
    if (setNo < exStep.sets) {
      if (exStep.restSeconds > 0) startRest(exStep.restSeconds);
      else setSetNo((n) => n + 1);
    } else {
      // last set done → advance to next step
      setSetNo(1);
      goToNextStep();
    }
  }

  function goToNextStep() {
    if (!program) return;
    if (index + 1 >= program.steps.length) {
      finish();
    } else {
      setIndex((i) => i + 1);
    }
  }

  function goBack() {
    setResting(false);
    if (setNo > 1) {
      setSetNo((n) => n - 1);
    } else if (index > 0) {
      const prev = program!.steps[index - 1];
      setIndex((i) => i - 1);
      setSetNo(prev && prev.kind === 'exercise' ? prev.sets : 1);
    }
  }

  function finish() {
    store.completeProgram(programId, exerciseTotal);
    setFinished(true);
    showToast('Træning gennemført. Godt gået!');
  }

  if (finished) {
    return (
      <main>
        <div className="player" aria-hidden="true">🎉</div>
        <div className="center">
          <h2 className="exercise">Godt gået!</h2>
          <div className="meta" style={{ fontSize: 16 }}>{program.title} gennemført</div>
        </div>
        <button type="button" className="btn primary block" style={{ marginTop: 20 }} onClick={() => navigate('/today')}>
          Færdig
        </button>
      </main>
    );
  }

  if (!step) {
    finish();
    return null;
  }

  if (isRestView) {
    const label = resting ? 'Pause mellem sæt' : 'Pause';
    return (
      <main>
        <div className="player" aria-hidden="true" style={{ background: 'linear-gradient(145deg,#f6ecd4,#ecdcae)' }}>
          ⏱
        </div>
        <div className="center">
          <div className="counter">{label}</div>
          <div className="exercise">Hvil</div>
          <div className="timer" style={{ fontSize: 54, fontWeight: 850, margin: '18px 0' }}>
            {formatClock(Math.max(0, remaining))}
          </div>
        </div>
        <div className="playeractions">
          <button type="button" className="btn" onClick={() => setRemaining((r) => r + 15)}>
            +15 sek.
          </button>
          <button type="button" className="btn primary" onClick={advanceAfterRest}>
            Spring pause over
          </button>
        </div>
      </main>
    );
  }

  // exercise set view
  const exStep = step as ExerciseStep;
  const exercise = exerciseById(store.exercises, exStep.exerciseId);
  const category = exercise?.category ?? 'bodyweight';
  const amount = exStep.mode === 'time' ? `${exStep.amount} sek.` : `${exStep.amount} reps`;
  const weight =
    exercise && categorySupportsWeight(exercise.category) && exStep.weightKg > 0
      ? ` · ${exStep.weightKg} kg`
      : '';

  return (
    <main>
      <div className={`player${exercise?.image ? ' hasimage' : ''}`} aria-hidden="true">
        {exercise?.image ? (
          <img src={exercise.image} alt="" />
        ) : (
          CATEGORY_EMOJI[category]
        )}
      </div>
      <div className="center">
        <div className="counter">Øvelse {exerciseNumber} af {exerciseTotal}</div>
        <div className="exercise">{exercise?.title ?? 'Øvelse'}</div>
        <div className="meta" style={{ fontSize: 16 }}>
          Sæt {setNo} af {exStep.sets} · {amount}{weight}
        </div>
      </div>
      <div className="playeractions">
        <button
          type="button"
          className="btn"
          onClick={() => (setNo > 1 || index > 0 ? goBack() : navigate(`/workouts/programs/${programId}`))}
        >
          {setNo > 1 || index > 0 ? 'Tilbage' : 'Afslut'}
        </button>
        <button type="button" className="btn primary" onClick={() => completeSet(exStep)}>
          {setNo < exStep.sets ? 'Færdig sæt ✓' : 'Færdig øvelse ✓'}
        </button>
      </div>
    </main>
  );
}
