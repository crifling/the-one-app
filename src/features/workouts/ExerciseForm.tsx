import { useRef, useState } from 'react';

import type { BodyPartId, Exercise, WorkoutCategory } from '../../store/types';
import { BODY_PARTS } from '../../data/bodyParts';
import { CATEGORY_LABELS, categorySupportsWeight } from './logic';
import { fileToResizedDataUrl } from './imageUpload';

export interface ExerciseFormValue {
  title: string;
  category: WorkoutCategory;
  bodyPart: BodyPartId;
  image: string | null;
}

interface ExerciseFormProps {
  onSubmit: (value: ExerciseFormValue) => void;
  onCancel: () => void;
  /** When set, the form edits this exercise instead of creating a new one. */
  exercise?: Exercise;
  /** Delete the exercise being edited. Only used in edit mode. */
  onDelete?: () => void;
}

const CATEGORIES: WorkoutCategory[] = ['bodyweight', 'mobility', 'speediance'];

/** Bottom-sheet form for creating a new library exercise or editing an existing one. */
export function ExerciseForm({ onSubmit, onCancel, exercise, onDelete }: ExerciseFormProps) {
  const editing = exercise != null;
  const [title, setTitle] = useState(exercise?.title ?? '');
  const [category, setCategory] = useState<WorkoutCategory>(exercise?.category ?? 'bodyweight');
  const [bodyPart, setBodyPart] = useState<BodyPartId>(exercise?.bodyPart ?? 'legs');
  const [image, setImage] = useState<string | null>(exercise?.image ?? null);
  const [imageBusy, setImageBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageBusy(true);
    try {
      setImage(await fileToResizedDataUrl(file));
    } finally {
      setImageBusy(false);
    }
  }

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit({ title: trimmed, category, bodyPart, image });
  }

  return (
    <div
      className="sheet-scrim"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="sheet" role="dialog" aria-label={editing ? 'Rediger øvelse' : 'Ny øvelse'}>
        <div className="grabber" />
        <div className="sheet-head">
          <h2>{editing ? 'Rediger øvelse' : 'Ny øvelse'}</h2>
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

          <div className="field">
            <span>Billede (valgfrit)</span>
            <div className="row" style={{ gap: 12 }}>
              {image ? (
                <img className="exthumb" src={image} alt="" style={{ width: 64, height: 64 }} />
              ) : (
                <div className="icon" aria-hidden="true" style={{ width: 64, height: 64 }}>
                  🖼️
                </div>
              )}
              <div className="grow">
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => fileInput.current?.click()}
                  disabled={imageBusy}
                >
                  {imageBusy ? 'Indlæser…' : image ? 'Skift billede' : 'Vælg billede'}
                </button>
                {image && (
                  <button
                    type="button"
                    className="btn sm"
                    style={{ marginLeft: 8 }}
                    onClick={() => setImage(null)}
                  >
                    Fjern
                  </button>
                )}
              </div>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{ display: 'none' }}
            />
            <div className="meta">Vises når du kører et program med øvelsen.</div>
          </div>

          {editing && onDelete && (
            <div className="field">
              <button
                type="button"
                className="btn danger block"
                onClick={() => {
                  if (
                    confirm(
                      `Slet øvelsen "${exercise.title}"? Den fjernes også fra programmer. Dette kan ikke fortrydes.`,
                    )
                  ) {
                    onDelete();
                  }
                }}
              >
                Slet øvelse
              </button>
            </div>
          )}
        </div>

        <div className="actions" style={{ marginTop: 6 }}>
          <button type="button" className="btn" onClick={onCancel}>
            Annullér
          </button>
          <button type="button" className="btn primary" onClick={submit} disabled={!title.trim()}>
            {editing ? 'Gem ændringer' : 'Gem øvelse'}
          </button>
        </div>
      </div>
    </div>
  );
}
