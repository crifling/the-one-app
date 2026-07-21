import { useRef, useState } from 'react';

import type { BodyPartId, WorkoutCategory } from '../../store/types';
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
}

const CATEGORIES: WorkoutCategory[] = ['bodyweight', 'mobility', 'speediance'];

/** Bottom-sheet form for creating a new library exercise. */
export function ExerciseForm({ onSubmit, onCancel }: ExerciseFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorkoutCategory>('bodyweight');
  const [bodyPart, setBodyPart] = useState<BodyPartId>('legs');
  const [image, setImage] = useState<string | null>(null);
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
