import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

import { BottomNav } from './components/BottomNav';
import { ToastProvider } from './components/ToastProvider';
import { useStore } from './store/store';

import { TodayScreen } from './features/today/TodayScreen';
import { TasksScreen } from './features/tasks/TasksScreen';
import { TracksScreen } from './features/tracks/TracksScreen';
import { TrackDetailScreen } from './features/tracks/TrackDetailScreen';
import { RoutinesScreen } from './features/routines/RoutinesScreen';
import { RoutineDetailScreen } from './features/routines/RoutineDetailScreen';
import { WorkoutsScreen } from './features/workouts/WorkoutsScreen';
import { ProgramDetailScreen } from './features/workouts/ProgramDetailScreen';
import { ProgramPlayerScreen } from './features/workouts/ProgramPlayerScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';

export function App() {
  const hydrated = useStore((s) => s._hasHydrated);
  const seedIfEmpty = useStore((s) => s.seedIfEmpty);

  // Install seed data once, only when no user data exists.
  useEffect(() => {
    if (hydrated) seedIfEmpty();
  }, [hydrated, seedIfEmpty]);

  if (!hydrated) {
    return <div className="splash">Indlæser…</div>;
  }

  return (
    <ToastProvider>
      <HashRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<Navigate to="/today" replace />} />
            <Route path="/today" element={<TodayScreen />} />
            <Route path="/tasks" element={<TasksScreen />} />
            <Route path="/tracks" element={<TracksScreen />} />
            <Route path="/tracks/:trackId" element={<TrackDetailScreen />} />
            <Route path="/routines" element={<RoutinesScreen />} />
            <Route path="/routines/:routineId" element={<RoutineDetailScreen />} />
            <Route path="/workouts" element={<WorkoutsScreen />} />
            <Route path="/workouts/programs/:programId" element={<ProgramDetailScreen />} />
            <Route path="/workouts/programs/:programId/play" element={<ProgramPlayerScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="*" element={<Navigate to="/today" replace />} />
          </Routes>
          <BottomNav />
        </div>
      </HashRouter>
    </ToastProvider>
  );
}
