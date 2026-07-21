import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { TopBar } from '../../components/TopBar';
import { CheckRow } from '../../components/CheckRow';
import { useStore } from '../../store/store';
import { createId } from '../../lib/id';
import { todayIso } from '../../lib/dates';
import { completedStepsForToday, SCHEDULE_LABELS } from './logic';

export function RoutineDetailScreen() {
  const { routineId = '' } = useParams();
  const store = useStore();
  const navigate = useNavigate();
  const today = todayIso();

  const routine = store.routines.find((r) => r.id === routineId);
  const [newStep, setNewStep] = useState('');

  if (!routine) {
    return (
      <>
        <TopBar title="Rutine" back="/routines" />
        <main>
          <div className="empty">Rutinen blev ikke fundet.</div>
        </main>
      </>
    );
  }

  const completed = completedStepsForToday(store.routineProgress[routine.id], today);

  function addStep() {
    const trimmed = newStep.trim();
    if (!trimmed || !routine) return;
    store.updateRoutine(routine.id, {
      steps: [...routine.steps, { id: createId(), text: trimmed }],
    });
    setNewStep('');
  }

  function removeStep(stepId: string) {
    if (!routine) return;
    store.updateRoutine(routine.id, {
      steps: routine.steps.filter((s) => s.id !== stepId),
    });
  }

  return (
    <>
      <TopBar eyebrow="Rutine" title={routine.name} back="/routines" />
      <main>
        <div className="detail">
          <div className="eyebrow">{SCHEDULE_LABELS[routine.schedule]}</div>
          <h2 className="detailtitle">{routine.name}</h2>
          <div className="meta">
            {routine.steps.length} trin · afkrydsning nulstilles hver dag
          </div>
        </div>

        {routine.steps.map((step) => (
          <CheckRow
            key={step.id}
            checked={completed.includes(step.id)}
            onToggle={() => store.toggleRoutineStepToday(routine.id, step.id)}
            title={step.text}
            trailing={
              <button
                type="button"
                className="iconbtn"
                aria-label={`Slet trin ${step.text}`}
                onClick={() => removeStep(step.id)}
              >
                🗑
              </button>
            }
          />
        ))}

        <div className="card" style={{ marginTop: 4 }}>
          <label className="field" style={{ marginBottom: 8 }}>
            <span>Nyt trin</span>
            <input
              className="input"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              placeholder="Beskriv et trin"
              onKeyDown={(e) => {
                if (e.key === 'Enter') addStep();
              }}
            />
          </label>
          <button
            type="button"
            className="btn primary block"
            onClick={addStep}
            disabled={!newStep.trim()}
          >
            Tilføj trin
          </button>
        </div>

        <div className="label">Farezone</div>
        <button
          type="button"
          className="btn danger block"
          onClick={() => {
            if (confirm(`Slet rutinen "${routine.name}"?`)) {
              store.deleteRoutine(routine.id);
              navigate('/routines');
            }
          }}
        >
          Slet rutine
        </button>
      </main>
    </>
  );
}
