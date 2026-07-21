import { useMemo, useState } from 'react';

import { TopBar } from '../../components/TopBar';
import { CheckRow } from '../../components/CheckRow';
import { useStore } from '../../store/store';
import type { Task } from '../../store/types';
import { formatShortDate, todayIso } from '../../lib/dates';
import { PriorityTag } from './PriorityTag';
import { TaskForm, type TaskFormValue } from './TaskForm';

type Filter = 'all' | 'today' | 'week' | 'done';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Åbne' },
  { id: 'today', label: 'I dag' },
  { id: 'week', label: 'Denne uge' },
  { id: 'done', label: 'Fuldførte' },
];

function withinNextWeek(due: string | null, today: string): boolean {
  if (!due) return false;
  const end = new Date(today);
  end.setDate(end.getDate() + 7);
  return due >= today && due <= todayIso(end);
}

export function TasksScreen() {
  const store = useStore();
  const today = todayIso();
  const [filter, setFilter] = useState<Filter>('all');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const visible = useMemo(() => {
    return store.tasks.filter((t) => {
      switch (filter) {
        case 'done':
          return t.completed;
        case 'today':
          return !t.completed && t.dueDate === today;
        case 'week':
          return !t.completed && withinNextWeek(t.dueDate, today);
        case 'all':
        default:
          return !t.completed;
      }
    });
  }, [store.tasks, filter, today]);

  function handleCreate(value: TaskFormValue) {
    store.addTask(value);
    setCreating(false);
  }

  function handleEdit(value: TaskFormValue) {
    if (!editing) return;
    store.updateTask(editing.id, value);
    setEditing(null);
  }

  return (
    <>
      <TopBar eyebrow="Generelle opgaver" title="Opgaver" showSettings />
      <main>
        <div className="callout">
          Her ligger kun generelle opgaver. Handlinger fra spor holdes adskilt
          inde i hvert spor.
        </div>

        <div className="filters" role="tablist" aria-label="Filtrér opgaver">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={`filter${filter === f.id ? ' active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {!creating && !editing && (
          <button
            type="button"
            className="btn primary block"
            onClick={() => setCreating(true)}
            style={{ marginBottom: 14 }}
          >
            + Ny opgave
          </button>
        )}

        {creating && (
          <TaskForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        )}
        {editing && (
          <TaskForm
            initial={editing}
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
          />
        )}

        {visible.length === 0 && !creating && (
          <div className="empty">Ingen opgaver her.</div>
        )}

        {visible.map((task) => (
          <CheckRow
            key={task.id}
            checked={task.completed}
            onToggle={() => store.toggleTask(task.id)}
            title={task.title}
            meta={task.dueDate ? `Forfald: ${formatShortDate(task.dueDate)}` : undefined}
            tag={task.priority !== 'normal' ? <PriorityTag priority={task.priority} /> : undefined}
            trailing={
              <div className="row" style={{ gap: 0 }}>
                <button
                  type="button"
                  className="iconbtn"
                  aria-label={`Redigér ${task.title}`}
                  onClick={() => {
                    setCreating(false);
                    setEditing(task);
                  }}
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="iconbtn"
                  aria-label={`Slet ${task.title}`}
                  onClick={() => store.deleteTask(task.id)}
                >
                  🗑
                </button>
              </div>
            }
          />
        ))}
      </main>
    </>
  );
}
