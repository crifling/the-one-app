import { useState } from 'react';

import type { BodyPartId, WorkoutCategory } from '../../store/types';
import { BODY_PARTS } from '../../data/bodyParts';
import { CATEGORY_LABELS, categorySupportsWeight } from './logic';

export interface ExerciseFormValue {
  title: string;
  category: WorkoutCategory;
  bodyPart: BodyPartId;
}

interface ExerciseFormProps {
  onSubmit: (value: ExerciseFormValue) => void;
  onCancel: () => void;
}

const CATEGORIES: WorkoutCategory[] = ['bodyweight', 'mobility', 'speediance'];

/** Bottom-sheet form for creating a new library exercise. */
export function ExerciseForm({ onSubmit, onCancel }: ExerciseFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorkoutCategory>('bodyweight');
  const [bodyPart, setBodyPart] = useState<BodyPartId>('legs');

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit({ title: trimmed, category, bodyPart });
  }

  return (
    <div
      className="sheet-scrim"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="sheet" role="dialog" aria-label="Ny øvelse">
        <div className="grabber" />
        <div className="sheet-head">
          <h2>Ny øvelse</h2>
        </div>
        <div className="sheet-scroll">
          <label className="field">
            <span>Titel</span>
            <input
              className="input"
              value={title}
              autoFocus
              placeholder="F.eks. Bulgarian split squat"
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
            />
          </label>

          <div className="field">
            <span>Kategori</span>
            <div className="segmented" role="radiogroup" aria-label="Kategori">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={category === c}
                  className={category === c ? 'active' : ''}
                  onClick={() => setCategory(c)}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
            <div className="meta">
              {categorySupportsWeight(category)
                ? 'Denne kategori understøtter vægt (kg) i programmer.'
                : 'Ingen vægt for denne kategori.'}
            </div>
          </div>

          <div className="field">
            <span>Kropsdel</span>
            <div className="chips">
              {BODY_PARTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`chip part${bodyPart === p.id ? ' active' : ''}`}
                  aria-pressed={bodyPart === p.id}
                  onClick={() => setBodyPart(p.id)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="actions" style={{ marginTop: 6 }}>
          <button type="button" className="btn" onClick={onCancel}>
            Annullér
          </button>
          <button type="button" className="btn primary" onClick={submit} disabled={!title.trim()}>
            Gem øvelse
          </button>
        </div>
      </div>
    </div>
  );
}
