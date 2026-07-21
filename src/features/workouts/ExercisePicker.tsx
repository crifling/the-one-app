import { useMemo, useState } from 'react';

import type { Exercise, ProgramStep, WorkoutCategory } from '../../store/types';
import { bodyPartName } from '../../data/bodyParts';
import { CATEGORY_EMOJI, CATEGORY_LABELS } from './logic';

interface ExercisePickerProps {
  exercises: Exercise[];
  steps: ProgramStep[];
  onAdd: (exerciseId: string) => void;
  onRemove: (exerciseId: string) => void;
  onClose: () => void;
  onCreateNew: () => void;
}

type Filter = 'all' | WorkoutCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'bodyweight', label: 'Kropsvægt' },
  { id: 'mobility', label: 'Mobilitet' },
  { id: 'speediance', label: 'Speediance' },
];

/** Bottom-sheet exercise picker with per-exercise counts and add/remove. */
export function ExercisePicker({
  exercises,
  steps,
  onAdd,
  onRemove,
  onClose,
  onCreateNew,
}: ExercisePickerProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const step of steps) {
      if (step.kind === 'exercise') {
        map.set(step.exerciseId, (map.get(step.exerciseId) ?? 0) + 1);
      }
    }
    return map;
  }, [steps]);

  const total = steps.filter((s) => s.kind === 'exercise').length;

  const visible = exercises.filter(
    (e) =>
      (filter === 'all' || e.category === filter) &&
      e.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div
      className="sheet-scrim"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet" role="dialog" aria-label="Tilføj øvelser">
        <div className="grabber" />
        <div className="sheet-head">
          <h2>Tilføj øvelser</h2>
          <span className="meta" style={{ marginTop: 0 }}>
            {total} i programmet
          </span>
        </div>

        <input
          className="input"
          style={{ marginBottom: 10 }}
          value={query}
          placeholder="Søg øvelse…"
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="chips scroll">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`chip${filter === f.id ? ' active' : ''}`}
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="sheet-scroll">
          {visible.map((e) => {
            const n = counts.get(e.id) ?? 0;
            return (
              <div key={e.id} className={`pick${n > 0 ? ' inprog' : ''}`}>
                {n > 0 ? (
                  <div className="countbadge">×{n}</div>
                ) : (
                  <div className="icon" aria-hidden="true" style={{ width: 44, height: 44, fontSize: 20 }}>
                    {CATEGORY_EMOJI[e.category]}
                  </div>
                )}
                <div className="grow">
                  <h3 style={{ fontSize: 15 }}>{e.title}</h3>
                  <div className="meta">
                    {CATEGORY_LABELS[e.category]} · {bodyPartName(e.bodyPart)}
                  </div>
                </div>
                {n > 0 ? (
                  <div className="qty">
                    <button
                      type="button"
                      className="rnd"
                      aria-label={`Fjern én ${e.title}`}
                      onClick={() => onRemove(e.id)}
                    >
                      −
                    </button>
                    <span className="n">{n}</span>
                    <button
                      type="button"
                      className="rnd"
                      aria-label={`Tilføj én ${e.title}`}
                      onClick={() => onAdd(e.id)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button type="button" className="addbtn" onClick={() => onAdd(e.id)}>
                    + Tilføj
                  </button>
                )}
              </div>
            );
          })}
          {visible.length === 0 && (
            <div className="empty">Ingen match. Opret en ny øvelse.</div>
          )}
        </div>

        <div className="actions" style={{ marginTop: 8 }}>
          <button type="button" className="btn" onClick={onCreateNew}>
            + Ny øvelse
          </button>
          <button type="button" className="btn primary" onClick={onClose}>
            Færdig
          </button>
        </div>
      </div>
    </div>
  );
}
