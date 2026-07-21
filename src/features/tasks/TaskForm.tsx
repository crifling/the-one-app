import { useState } from 'react';
import type { Priority, Task } from '../../store/types';

export interface TaskFormValue {
  title: string;
  dueDate: string | null;
  priority: Priority;
}

interface TaskFormProps {
  initial?: Task;
  onSubmit: (value: TaskFormValue) => void;
  onCancel: () => void;
}

export function TaskForm({ initial, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'normal');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit({ title: trimmed, dueDate: dueDate || null, priority });
  }

  return (
    <form className="card" onSubmit={submit}>
      <label className="field">
        <span>Titel</span>
        <input
          className="input"
          value={title}
          autoFocus
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Hvad skal der gøres?"
        />
      </label>
      <label className="field">
        <span>Forfaldsdato (valgfri)</span>
        <input
          className="input"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </label>
      <label className="field">
        <span>Prioritet</span>
        <select
          className="select"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
        >
          <option value="high">Vigtig</option>
          <option value="normal">Normal</option>
          <option value="low">Kan vente</option>
        </select>
      </label>
      <div className="actions">
        <button type="button" className="btn" onClick={onCancel}>
          Annullér
        </button>
        <button type="submit" className="btn primary" disabled={!title.trim()}>
          Gem
        </button>
      </div>
    </form>
  );
}
