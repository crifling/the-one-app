import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useToast } from '../../components/ToastProvider';
import { useStore } from '../../store/store';
import type { ExerciseStep } from '../../store/types';
import { CATEGORY_EMOJI, categorySupportsWeight, exerciseById } from './logic';
import { CountdownRing } from './CountdownRing';
import { goBeep, tickBeep, unlockSound } from './sound';

const GET_READY = 3;

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

/** Timed exercise sub-phase. */
type Timed = 'idle' | 'ready' | 'getready' | 'running';

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
  const [total, setTotal] = useState(0);
  const [timed, setTimed] = useState<Timed>('idle');
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);

  const step = program?.steps[index];

  // Initialise the timer state whenever we move to a new step.
  useEffect(() => {
    const s = program?.steps[index];
    setResting(false);
    setPaused(false);
    if (!s) return;
    if (s.kind === 'pause') {
      setTimed('idle');
      setTotal(s.seconds);
      setRemaining(s.seconds);
    } else if (s.mode === 'time') {
      setTimed('ready');
      setTotal(s.amount);
      setRemaining(s.amount);
    } else {
      setTimed('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const counting =
    !finished &&
    !paused &&
    !!step &&
    (step.kind === 'pause' ||
      resting ||
      (step.kind === 'exercise' && step.mode === 'time' && (timed === 'getready' || timed === 'running')));

  // The single ticking loop for pauses, between-set rests and timed sets.
  useEffect(() => {
    if (!counting || !step) return;
    if (remaining > 0) {
      if (remaining <= 3) tickBeep();
      const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
      return () => clearTimeout(id);
    }
    // remaining === 0 → transition
    goBeep();
    if (step.kind === 'pause') {
      goToNextStep();
    } else if (resting) {
      endRestToNextSet();
    } else if (timed === 'getready') {
      const s = step as ExerciseStep;
      setTimed('running');
      setTotal(s.amount);
      setRemaining(s.amount);
    } else if (timed === 'running') {
      onWorkComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counting, remaining]);

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
    setTotal(seconds);
    setRemaining(seconds);
    setPaused(false);
    setResting(true);
  }

  function beginNextTimedSet() {
    setTimed('getready');
    setTotal(GET_READY);
    setRemaining(GET_READY);
  }

  function endRestToNextSet() {
    setResting(false);
    const next = setNo + 1;
    setSetNo(next);
    const s = program!.steps[index];
    if (s && s.kind === 'exercise' && s.mode === 'time') beginNextTimedSet();
    else setTimed('idle');
  }

  function onWorkComplete() {
    const s = step as ExerciseStep;
    if (setNo < s.sets) {
      if (s.restSeconds > 0) startRest(s.restSeconds);
      else {
        setSetNo((n) => n + 1);
        beginNextTimedSet();
      }
    } else {
      setSetNo(1);
      goToNextStep();
    }
  }

  // Manual completion for reps-based sets.
  function completeRepsSet(s: ExerciseStep) {
    if (setNo < s.sets) {
      if (s.restSeconds > 0) startRest(s.restSeconds);
      else setSetNo((n) => n + 1);
    } else {
      setSetNo(1);
      goToNextStep();
    }
  }

  function goToNextStep() {
    if (index + 1 >= program!.steps.length) finish();
    else setIndex((i) => i + 1);
  }

  function skipRest() {
    setRemaining(0); // lets the effect run the transition uniformly
  }

  function goBack() {
    setResting(false);
    setPaused(false);
    if (setNo > 1) {
      setSetNo((n) => n - 1);
      const s = program!.steps[index];
      if (s && s.kind === 'exercise' && s.mode === 'time') {
        setTimed('ready');
        setTotal(s.amount);
        setRemaining(s.amount);
      }
    } else if (index > 0) {
      const prev = program!.steps[index - 1];
      setSetNo(prev && prev.kind === 'exercise' ? prev.sets : 1);
      setIndex((i) => i - 1);
    }
  }

  function finish() {
    store.completeProgram(programId, exerciseTotal);
    setFinished(true);
    showToast('Træning gennemført. Godt gået!');
  }

  // ---- render ----
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

  // Pause step or between-set rest → rest ring.
  if (step.kind === 'pause' || resting) {
    return (
      <main>
        <div className="center">
          <div className="counter">{resting ? 'Pause mellem sæt' : 'Pause'}</div>
        </div>
        <div className="ringwrap">
          <CountdownRing remaining={remaining} total={total} tone="rest" display={formatClock(remaining)} caption="HVIL" />
        </div>
        <div className="playeractions">
          <button type="button" className="btn" onClick={() => { setTotal((t) => t + 15); setRemaining((r) => r + 15); }}>
            +15 sek.
          </button>
          <button type="button" className="btn primary" onClick={skipRest}>
            Spring over
          </button>
        </div>
        <button type="button" className="btn block" style={{ marginTop: 9 }} onClick={() => setPaused((p) => !p)}>
          {paused ? 'Fortsæt' : 'Pause'}
        </button>
      </main>
    );
  }

  const exStep = step as ExerciseStep;
  const exercise = exerciseById(store.exercises, exStep.exerciseId);
  const category = exercise?.category ?? 'bodyweight';
  const weight =
    exercise && categorySupportsWeight(exercise.category) && exStep.weightKg > 0
      ? ` · ${exStep.weightKg} kg`
      : '';

  // Timed set — get-ready / running → exercise image on top, ring below.
  if (exStep.mode === 'time' && (timed === 'getready' || timed === 'running')) {
    const isReady = timed === 'getready';
    return (
      <main>
        <div className={`player compact${exercise?.image ? ' hasimage' : ''}`} aria-hidden="true">
          {exercise?.image ? <img src={exercise.image} alt="" /> : CATEGORY_EMOJI[category]}
        </div>
        <div className="center">
          <div className="counter">Øvelse {exerciseNumber} af {exerciseTotal} · sæt {setNo} af {exStep.sets}</div>
          <div className="exercise" style={{ fontSize: 23 }}>{exercise?.title ?? 'Øvelse'}</div>
        </div>
        <div className="ringwrap">
          <CountdownRing
            remaining={remaining}
            total={total}
            tone="work"
            size={196}
            display={isReady ? String(remaining) : formatClock(remaining)}
            caption={isReady ? 'GØR KLAR' : undefined}
          />
        </div>
        {isReady ? (
          <button type="button" className="btn primary block" onClick={() => { setTimed('running'); setTotal(exStep.amount); setRemaining(exStep.amount); }}>
            Spring klargøring over
          </button>
        ) : (
          <>
            <div className="playeractions">
              <button type="button" className="btn" onClick={() => { setTotal((t) => t + 15); setRemaining((r) => r + 15); }}>
                +15 sek.
              </button>
              <button type="button" className="btn primary" onClick={onWorkComplete}>
                Færdig ✓
              </button>
            </div>
            <button type="button" className="btn block" style={{ marginTop: 9 }} onClick={() => setPaused((p) => !p)}>
              {paused ? 'Fortsæt' : 'Pause'}
            </button>
          </>
        )}
      </main>
    );
  }

  // Reps set, or timed set in the "ready" state (show the exercise first).
  const showStartButton = exStep.mode === 'time' && timed === 'ready';
  const dose = exStep.mode === 'time' ? `${exStep.amount} sek.` : `${exStep.amount} reps`;

  return (
    <main>
      <div className={`player${exercise?.image ? ' hasimage' : ''}`} aria-hidden="true">
        {exercise?.image ? <img src={exercise.image} alt="" /> : CATEGORY_EMOJI[category]}
      </div>
      <div className="center">
        <div className="counter">Øvelse {exerciseNumber} af {exerciseTotal}</div>
        <div className="exercise">{exercise?.title ?? 'Øvelse'}</div>
        <div className="meta" style={{ fontSize: 16 }}>
          Sæt {setNo} af {exStep.sets} · {dose}{weight}
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
        {showStartButton ? (
          <button
            type="button"
            className="btn primary"
            onClick={() => { unlockSound(); setTimed('getready'); setTotal(GET_READY); setRemaining(GET_READY); }}
          >
            Start sæt ▶
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={() => completeRepsSet(exStep)}>
            {setNo < exStep.sets ? 'Færdig sæt ✓' : 'Færdig øvelse ✓'}
          </button>
        )}
      </div>
    </main>
  );
}
