import { useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { TopBar } from '../../components/TopBar';
import { useToast } from '../../components/ToastProvider';
import { useStore } from '../../store/store';
import type { ExerciseStep, ProgramStep, StepMode } from '../../store/types';
import { bodyPartName } from '../../data/bodyParts';
import { createId } from '../../lib/id';
import { todayIso } from '../../lib/dates';
import { Stepper } from './Stepper';
import { ExercisePicker } from './ExercisePicker';
import { ExerciseForm, type ExerciseFormValue } from './ExerciseForm';
import {
  CATEGORY_LABELS,
  categorySupportsWeight,
  defaultStepFor,
  estimateMinutes,
  exerciseById,
  stepDose,
} from './logic';

const REST_PRESETS = [30, 45, 60, 90];
const PAUSE_PRESETS = [30, 60, 90, 120];

export function ProgramDetailScreen() {
  const { programId = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const store = useStore();
  const { showToast } = useToast();

  const program = store.programs.find((p) => p.id === programId);
  const navState = (location.state as { edit?: boolean; isNew?: boolean } | null) ?? null;

  const [editing, setEditing] = useState(Boolean(navState?.edit));
  const isNewRef = useRef(Boolean(navState?.isNew));
  const [draftTitle, setDraftTitle] = useState(program?.title ?? '');
  const [draftSteps, setDraftSteps] = useState<ProgramStep[]>(program?.steps ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newExOpen, setNewExOpen] = useState(false);

  if (!program) {
    return (
      <>
        <TopBar title="Program" back="/workouts" />
        <main>
          <div className="empty">Programmet blev ikke fundet.</div>
        </main>
      </>
    );
  }

  const steps = editing ? draftSteps : program.steps;
  const exerciseCount = steps.filter((s) => s.kind === 'exercise').length;
  const minutes = estimateMinutes(editing ? { ...program, steps: draftSteps } : program);
  const isTodaysProgram =
    store.todaysProgram?.programId === programId &&
    store.todaysProgram?.date === todayIso();

  function startEdit() {
    if (!program) return;
    setDraftTitle(program.title);
    setDraftSteps(program.steps.map((s) => ({ ...s })));
    setEditing(true);
  }

  function save() {
    if (!draftTitle.trim()) {
      showToast('Giv programmet et navn.', 'error');
      return;
    }
    store.updateProgram(programId, { title: draftTitle, steps: draftSteps });
    isNewRef.current = false;
    setEditing(false);
    showToast('Program gemt.');
  }

  function cancel() {
    if (isNewRef.current) {
      store.deleteProgram(programId);
      navigate('/workouts');
      return;
    }
    setEditing(false);
  }

  function onBack() {
    if (editing && isNewRef.current) {
      store.deleteProgram(programId);
    }
    navigate('/workouts');
  }

  function patchStep(index: number, patch: Partial<ExerciseStep>) {
    setDraftSteps((prev) =>
      prev.map((s, i) => (i === index && s.kind === 'exercise' ? { ...s, ...patch } : s)),
    );
  }
  function patchPause(index: number, seconds: number) {
    setDraftSteps((prev) =>
      prev.map((s, i) => (i === index && s.kind === 'pause' ? { ...s, seconds } : s)),
    );
  }
  function moveStep(index: number, dir: -1 | 1) {
    setDraftSteps((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[index], next[j]] = [next[j]!, next[index]!];
      return next;
    });
  }
  function duplicateStep(index: number) {
    setDraftSteps((prev) => {
      const next = prev.slice();
      next.splice(index + 1, 0, { ...prev[index]!, id: createId() });
      return next;
    });
    showToast('Øvelse duplikeret.');
  }
  function deleteStep(index: number) {
    setDraftSteps((prev) => prev.filter((_, i) => i !== index));
  }
  function addPause() {
    setDraftSteps((prev) => [...prev, { id: createId(), kind: 'pause', seconds: 60 }]);
  }
  function addExerciseInstance(exerciseId: string) {
    const exercise = exerciseById(store.exercises, exerciseId);
    if (!exercise) return;
    setDraftSteps((prev) => [...prev, { id: createId(), ...defaultStepFor(exercise) }]);
  }
  function removeExerciseInstance(exerciseId: string) {
    setDraftSteps((prev) => {
      const idx = [...prev]
        .map((s, i) => ({ s, i }))
        .reverse()
        .find(({ s }) => s.kind === 'exercise' && s.exerciseId === exerciseId)?.i;
      if (idx == null) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  }
  function createExercise(value: ExerciseFormValue) {
    const id = store.addExercise(value);
    setNewExOpen(false);
    addExerciseInstance(id);
    showToast('Øvelse oprettet og tilføjet.');
  }

  return (
    <>
      <header className="top">
        <div className="row" style={{ gap: 10 }}>
          <button className="topbtn" onClick={onBack} aria-label="Tilbage">
            ‹
          </button>
          <div>
            <div className="eyebrow">{isNewRef.current ? 'Nyt program' : 'Program'}</div>
          </div>
        </div>
        <div className="row" style={{ gap: 4 }}>
          {editing && (
            <button className="link" onClick={cancel} style={{ color: 'var(--muted)' }}>
              Annullér
            </button>
          )}
          <button className="link" onClick={editing ? save : startEdit}>
            {editing ? 'Gem' : 'Rediger'}
          </button>
        </div>
      </header>

      <main>
        {editing ? (
          <input
            className="titlefield"
            value={draftTitle}
            placeholder="Programnavn"
            aria-label="Programnavn"
            autoFocus={isNewRef.current}
            onChange={(e) => setDraftTitle(e.target.value)}
          />
        ) : (
          <h2 className="detailtitle" style={{ margin: '2px 4px 10px' }}>
            {program.title || 'Uden navn'}
          </h2>
        )}

        <div className="estimate">
          <span>Anslået varighed</span>
          <span>
            <b>~{minutes} min</b> · {exerciseCount} {exerciseCount === 1 ? 'øvelse' : 'øvelser'}
          </span>
        </div>

        {steps.map((step, index) =>
          step.kind === 'pause'
            ? renderPause(step, index)
            : renderExercise(step, index),
        )}

        {steps.length === 0 && (
          <div className="empty">
            {editing ? 'Tomt program. Tryk "Tilføj øvelse".' : 'Ingen øvelser endnu.'}
          </div>
        )}

        {editing ? (
          <div className="actions" style={{ marginTop: 4 }}>
            <button type="button" className="btn ghost" onClick={() => setPickerOpen(true)}>
              + Tilføj øvelse
            </button>
            <button type="button" className="btn ghost" onClick={addPause}>
              + Pause
            </button>
          </div>
        ) : (
          <div className="actions" style={{ marginTop: 8 }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                store.setTodaysProgram(programId);
                showToast('Valgt som dagens træning.');
              }}
              disabled={isTodaysProgram}
            >
              {isTodaysProgram ? 'Valgt i dag' : 'Vælg til i dag'}
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                store.setTodaysProgram(programId);
                navigate(`/workouts/programs/${programId}/play`);
              }}
              disabled={exerciseCount === 0}
            >
              ▶ Start
            </button>
          </div>
        )}
      </main>

      {pickerOpen && (
        <ExercisePicker
          exercises={store.exercises}
          steps={draftSteps}
          onAdd={addExerciseInstance}
          onRemove={removeExerciseInstance}
          onClose={() => setPickerOpen(false)}
          onCreateNew={() => {
            setPickerOpen(false);
            setNewExOpen(true);
          }}
        />
      )}
      {newExOpen && (
        <ExerciseForm onSubmit={createExercise} onCancel={() => setNewExOpen(false)} />
      )}
    </>
  );

  function renderExercise(step: ExerciseStep, index: number) {
    const exercise = exerciseById(store.exercises, step.exerciseId);
    const title = exercise?.title ?? 'Slettet øvelse';
    const supportsWeight = exercise ? categorySupportsWeight(exercise.category) : false;

    return (
      <div key={step.id} className="step exercise">
        <div className="stephead">
          <div className="idx">{index + 1}</div>
          <div className="grow">
            <h3>{title}</h3>
            {exercise && (
              <div style={{ marginTop: 5, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="tag">{CATEGORY_LABELS[exercise.category]}</span>
                <span className="tag warm">{bodyPartName(exercise.bodyPart)}</span>
              </div>
            )}
          </div>
          {editing && (
            <div className="stepacts">
              <button type="button" className="miniact" aria-label="Flyt op" onClick={() => moveStep(index, -1)}>↑</button>
              <button type="button" className="miniact" aria-label="Flyt ned" onClick={() => moveStep(index, 1)}>↓</button>
              <button type="button" className="miniact" aria-label="Dupliker" onClick={() => duplicateStep(index)}>⧉</button>
              <button type="button" className="miniact del" aria-label="Slet" onClick={() => deleteStep(index)}>🗑</button>
            </div>
          )}
        </div>

        {editing ? (
          <>
            <div className="seg-mini" role="radiogroup" aria-label="Måleenhed">
              {(['reps', 'time'] as StepMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={step.mode === m}
                  className={step.mode === m ? 'active' : ''}
                  onClick={() =>
                    patchStep(index, { mode: m, amount: m === 'time' ? 40 : 10 })
                  }
                >
                  {m === 'reps' ? 'Reps' : 'Tid'}
                </button>
              ))}
            </div>
            <div className="stepper-grid">
              <Stepper label="Sæt" value={step.sets} min={1} max={12} onChange={(v) => patchStep(index, { sets: v })} />
              {step.mode === 'time' ? (
                <Stepper label="Tid (sek.)" value={step.amount} min={5} max={600} step={5} onChange={(v) => patchStep(index, { amount: v })} />
              ) : (
                <Stepper label="Reps" value={step.amount} min={1} max={50} onChange={(v) => patchStep(index, { amount: v })} />
              )}
              {supportsWeight && (
                <Stepper label="Vægt (kg)" value={step.weightKg} min={0} max={300} step={2.5} onChange={(v) => patchStep(index, { weightKg: v })} />
              )}
            </div>
            <div className="restrow" style={{ marginTop: 11 }}>
              <span className="steplbl" style={{ display: 'block', marginBottom: 6 }}>Pause mellem sæt</span>
              <div className="presets">
                {REST_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`preset${step.restSeconds === p ? ' active' : ''}`}
                    onClick={() => patchStep(index, { restSeconds: p })}
                  >
                    {p}s
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="viewline">{stepDose(step, exercise)}</div>
        )}
      </div>
    );
  }

  function renderPause(step: Extract<ProgramStep, { kind: 'pause' }>, index: number) {
    return (
      <div key={step.id} className="step pause">
        <div className="stephead">
          <div className="idx" aria-hidden="true">⏸</div>
          <div className="grow">
            <h3>Pause</h3>
            <div className="meta">
              Hvil før næste øvelse{!editing && ` · ${step.seconds >= 60 ? step.seconds / 60 + ' min' : step.seconds + ' sek.'}`}
            </div>
          </div>
          {editing && (
            <div className="stepacts">
              <button type="button" className="miniact" aria-label="Flyt op" onClick={() => moveStep(index, -1)}>↑</button>
              <button type="button" className="miniact" aria-label="Flyt ned" onClick={() => moveStep(index, 1)}>↓</button>
              <button type="button" className="miniact del" aria-label="Slet" onClick={() => deleteStep(index)}>🗑</button>
            </div>
          )}
        </div>
        {editing && (
          <div className="restrow" style={{ marginTop: 11 }}>
            <span className="steplbl" style={{ display: 'block', marginBottom: 6 }}>Længde</span>
            <div className="presets">
              {PAUSE_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`preset${step.seconds === p ? ' active' : ''}`}
                  onClick={() => patchPause(index, p)}
                >
                  {p >= 60 ? p / 60 + 'm' : p + 's'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}
