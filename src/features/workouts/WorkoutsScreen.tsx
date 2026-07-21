import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { TopBar } from '../../components/TopBar';
import { useToast } from '../../components/ToastProvider';
import { useStore } from '../../store/store';
import type { WorkoutCategory } from '../../store/types';
import { bodyPartName } from '../../data/bodyParts';
import {
  CATEGORY_EMOJI,
  CATEGORY_LABELS,
  categorySupportsWeight,
  programCategory,
  programSummary,
} from './logic';
import { ExerciseForm, type ExerciseFormValue } from './ExerciseForm';
import { ExerciseThumb } from './ExerciseThumb';

type Tab = 'programs' | 'exercises' | 'history';
type CatFilter = 'all' | WorkoutCategory;

const CAT_FILTERS: { id: CatFilter; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'bodyweight', label: 'Kropsvægt' },
  { id: 'mobility', label: 'Mobilitet' },
  { id: 'speediance', label: 'Speediance' },
];

export function WorkoutsScreen() {
  const store = useStore();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('programs');
  const [catFilter, setCatFilter] = useState<CatFilter>('all');
  const [creatingExercise, setCreatingExercise] = useState(false);

  const eyebrow = tab === 'history' ? 'Log' : 'Bibliotek';

  function newProgram() {
    const id = store.addProgram('');
    navigate(`/workouts/programs/${id}`, { state: { edit: true, isNew: true } });
  }

  function createExercise(value: ExerciseFormValue) {
    store.addExercise(value);
    setCreatingExercise(false);
    setCatFilter('all');
    showToast('Øvelse oprettet.');
  }

  const visibleExercises = useMemo(
    () =>
      store.exercises.filter((e) => catFilter === 'all' || e.category === catFilter),
    [store.exercises, catFilter],
  );

  return (
    <>
      <TopBar eyebrow={eyebrow} title="Træning" showSettings />
      <main>
        <div className="segmented" role="tablist" aria-label="Vis">
          <button role="tab" aria-selected={tab === 'programs'} className={tab === 'programs' ? 'active' : ''} onClick={() => setTab('programs')}>
            Programmer
          </button>
          <button role="tab" aria-selected={tab === 'exercises'} className={tab === 'exercises' ? 'active' : ''} onClick={() => setTab('exercises')}>
            Øvelser
          </button>
          <button role="tab" aria-selected={tab === 'history'} className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
            Historik
          </button>
        </div>

        {tab === 'programs' && (
          <>
            <button type="button" className="btn ghost block" onClick={newProgram} style={{ marginBottom: 14 }}>
              + Nyt program
            </button>
            {store.programs.length === 0 && <div className="empty">Ingen programmer endnu.</div>}
            {store.programs.map((program) => {
              const cat = programCategory(program, store.exercises);
              return (
                <Link key={program.id} className="card row tappable" to={`/workouts/programs/${program.id}`}>
                  <div className="workart" aria-hidden="true">
                    {CATEGORY_EMOJI[cat]}
                  </div>
                  <div className="grow">
                    <h3>{program.title || 'Uden navn'}</h3>
                    <div className="meta">{programSummary(program)}</div>
                  </div>
                  <span className="chev" aria-hidden="true">›</span>
                </Link>
              );
            })}
          </>
        )}

        {tab === 'exercises' && (
          <>
            <button type="button" className="btn primary block" onClick={() => setCreatingExercise(true)} style={{ marginBottom: 12 }}>
              + Ny øvelse
            </button>
            <div className="chips scroll">
              {CAT_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`chip${catFilter === f.id ? ' active' : ''}`}
                  aria-pressed={catFilter === f.id}
                  onClick={() => setCatFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {visibleExercises.length === 0 && <div className="empty">Ingen øvelser her.</div>}
            {visibleExercises.map((e) => (
              <div key={e.id} className="card row">
                <ExerciseThumb exercise={e} />
                <div className="grow">
                  <h3>{e.title}</h3>
                  <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className={`tag ${e.category === 'speediance' ? '' : e.category === 'mobility' ? 'pink' : 'blue'}`}>
                      {CATEGORY_LABELS[e.category]}
                    </span>
                    <span className="tag warm">{bodyPartName(e.bodyPart)}</span>
                    {categorySupportsWeight(e.category) && <span className="tag muted">vægt</span>}
                  </div>
                </div>
                <button
                  type="button"
                  className="iconbtn"
                  aria-label={`Slet ${e.title}`}
                  onClick={() => {
                    if (confirm(`Slet øvelsen "${e.title}"? Den fjernes også fra programmer.`)) {
                      store.deleteExercise(e.id);
                    }
                  }}
                >
                  🗑
                </button>
              </div>
            ))}
          </>
        )}

        {tab === 'history' && (
          <>
            {store.sessions.length === 0 && <div className="empty">Ingen gennemførte træninger endnu.</div>}
            {store.sessions.map((s) => (
              <div key={s.id} className="card row">
                <div className="grow">
                  <h3>{s.programName}</h3>
                  <div className="meta">
                    {new Date(s.completedAt).toLocaleDateString('da-DK', { day: 'numeric', month: 'long' })} · {s.exercisesCompleted}/{s.exercisesTotal} øvelser
                  </div>
                </div>
                <span className="tag">Fuldført</span>
              </div>
            ))}
          </>
        )}
      </main>

      {creatingExercise && (
        <ExerciseForm onSubmit={createExercise} onCancel={() => setCreatingExercise(false)} />
      )}
    </>
  );
}
