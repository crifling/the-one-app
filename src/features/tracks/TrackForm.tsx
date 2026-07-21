import { useState } from 'react';
import type { LifeAreaId, TrackType } from '../../store/types';
import { LIFE_AREAS } from '../../data/lifeAreas';

export interface TrackFormValue {
  name: string;
  lifeArea: LifeAreaId;
  type: TrackType;
}

interface TrackFormProps {
  onSubmit: (value: TrackFormValue) => void;
  onCancel: () => void;
}

export function TrackForm({ onSubmit, onCancel }: TrackFormProps) {
  const [name, setName] = useState('');
  const [lifeArea, setLifeArea] = useState<LifeAreaId>('family');
  const [type, setType] = useState<TrackType>('ongoing');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, lifeArea, type });
  }

  return (
    <form className="card" onSubmit={submit}>
      <label className="field">
        <span>Navn</span>
        <input
          className="input"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          placeholder="F.eks. en person, et mål eller et projekt"
        />
      </label>
      <label className="field">
        <span>Livsområde</span>
        <select
          className="select"
          value={lifeArea}
          onChange={(e) => setLifeArea(e.target.value as LifeAreaId)}
        >
          {LIFE_AREAS.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Type</span>
        <select
          className="select"
          value={type}
          onChange={(e) => setType(e.target.value as TrackType)}
        >
          <option value="ongoing">Løbende</option>
          <option value="completable">Afslutteligt</option>
        </select>
      </label>
      <div className="actions">
        <button type="button" className="btn" onClick={onCancel}>
          Annullér
        </button>
        <button type="submit" className="btn primary" disabled={!name.trim()}>
          Opret spor
        </button>
      </div>
    </form>
  );
}
