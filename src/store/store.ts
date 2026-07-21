import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type {
  AppData,
  Exercise,
  Idea,
  Priority,
  Routine,
  RoutineSchedule,
  Task,
  Track,
  TrackAction,
  TrackType,
  Workout,
} from './types';
import { CURRENT_VERSION, emptyAppData } from './defaults';
import { idbStorage } from '../persistence/idbStorage';
import { runMigrations } from '../persistence/migrations';
import { seedData } from '../data/seed';
import { createId } from '../lib/id';
import { todayIso } from '../lib/dates';
import { setTrackFocus, type SetFocusResult } from '../features/tracks/logic';
import { toggleRoutineStep } from '../features/routines/logic';

/** The persisted document keys (everything on AppData). */
const DATA_KEYS: (keyof AppData)[] = [
  'version',
  'lifeAreas',
  'tracks',
  'tasks',
  'routines',
  'routineProgress',
  'workouts',
  'workoutHistory',
  'todaysWorkout',
  'settings',
  'seeded',
];

export interface NewTrackInput {
  name: string;
  lifeArea: Track['lifeArea'];
  type: TrackType;
}

export interface NewTaskInput {
  title: string;
  dueDate?: string | null;
  priority?: Priority;
}

export interface StoreActions {
  // lifecycle
  _setHydrated: () => void;
  seedIfEmpty: () => void;
  getData: () => AppData;
  replaceAll: (data: AppData) => void;
  resetAll: () => void;

  // settings
  setUserName: (name: string) => void;

  // tracks
  addTrack: (input: NewTrackInput) => string;
  updateTrack: (id: string, patch: Partial<Pick<Track, 'name' | 'lifeArea' | 'type' | 'status'>>) => void;
  deleteTrack: (id: string) => void;
  setTrackFocus: (id: string, focus: boolean) => SetFocusResult;
  addTrackAction: (trackId: string, title: string) => void;
  toggleTrackAction: (trackId: string, actionId: string) => void;
  deleteTrackAction: (trackId: string, actionId: string) => void;
  setNextAction: (trackId: string, actionId: string | null) => void;
  addIdea: (trackId: string, text: string) => void;
  deleteIdea: (trackId: string, ideaId: string) => void;

  // tasks
  addTask: (input: NewTaskInput) => void;
  updateTask: (id: string, patch: Partial<Pick<Task, 'title' | 'dueDate' | 'priority'>>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // routines
  addRoutine: (name: string, schedule: RoutineSchedule) => string;
  updateRoutine: (id: string, patch: Partial<Pick<Routine, 'name' | 'schedule' | 'steps'>>) => void;
  deleteRoutine: (id: string) => void;
  toggleRoutineStepToday: (routineId: string, stepId: string) => void;

  // workouts
  setTodaysWorkout: (workoutId: string) => void;
  completeWorkout: (workoutId: string, exercisesCompleted: number) => void;
}

export interface AppState extends AppData, StoreActions {
  _hasHydrated: boolean;
}

const now = () => new Date().toISOString();

function pickData(state: AppState): AppData {
  const out = {} as AppData;
  for (const key of DATA_KEYS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (out as any)[key] = (state as any)[key];
  }
  return out;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...emptyAppData(),
      _hasHydrated: false,

      _setHydrated: () => set({ _hasHydrated: true }),

      seedIfEmpty: () => {
        if (get().seeded) return;
        set({ ...seedData() });
      },

      getData: () => pickData(get()),

      replaceAll: (data) => set({ ...runMigrations(data) }),

      resetAll: () => set({ ...emptyAppData(), seeded: true }),

      setUserName: (name) =>
        set((s) => ({ settings: { ...s.settings, userName: name } })),

      // ---- tracks ----
      addTrack: (input) => {
        const id = createId();
        const ts = now();
        const track: Track = {
          id,
          name: input.name.trim(),
          lifeArea: input.lifeArea,
          type: input.type,
          status: 'active',
          focus: false,
          nextActionId: null,
          actions: [],
          ideas: [],
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ tracks: [track, ...s.tracks] }));
        return id;
      },

      updateTrack: (id, patch) =>
        set((s) => ({
          tracks: s.tracks.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: now() } : t,
          ),
        })),

      deleteTrack: (id) =>
        set((s) => ({ tracks: s.tracks.filter((t) => t.id !== id) })),

      setTrackFocus: (id, focus) => {
        const result = setTrackFocus(get().tracks, id, focus, now());
        if (result.changed) set({ tracks: result.tracks });
        return result;
      },

      addTrackAction: (trackId, title) => {
        const ts = now();
        const action: TrackAction = {
          id: createId(),
          title: title.trim(),
          completed: false,
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({
          tracks: s.tracks.map((t) =>
            t.id === trackId
              ? { ...t, actions: [...t.actions, action], updatedAt: ts }
              : t,
          ),
        }));
      },

      toggleTrackAction: (trackId, actionId) =>
        set((s) => ({
          tracks: s.tracks.map((t) =>
            t.id === trackId
              ? {
                  ...t,
                  actions: t.actions.map((a) =>
                    a.id === actionId
                      ? { ...a, completed: !a.completed, updatedAt: now() }
                      : a,
                  ),
                  updatedAt: now(),
                }
              : t,
          ),
        })),

      deleteTrackAction: (trackId, actionId) =>
        set((s) => ({
          tracks: s.tracks.map((t) =>
            t.id === trackId
              ? {
                  ...t,
                  actions: t.actions.filter((a) => a.id !== actionId),
                  nextActionId:
                    t.nextActionId === actionId ? null : t.nextActionId,
                  updatedAt: now(),
                }
              : t,
          ),
        })),

      setNextAction: (trackId, actionId) =>
        set((s) => ({
          tracks: s.tracks.map((t) =>
            t.id === trackId ? { ...t, nextActionId: actionId, updatedAt: now() } : t,
          ),
        })),

      addIdea: (trackId, text) => {
        const idea: Idea = { id: createId(), text: text.trim(), createdAt: now() };
        set((s) => ({
          tracks: s.tracks.map((t) =>
            t.id === trackId
              ? { ...t, ideas: [idea, ...t.ideas], updatedAt: now() }
              : t,
          ),
        }));
      },

      deleteIdea: (trackId, ideaId) =>
        set((s) => ({
          tracks: s.tracks.map((t) =>
            t.id === trackId
              ? { ...t, ideas: t.ideas.filter((i) => i.id !== ideaId), updatedAt: now() }
              : t,
          ),
        })),

      // ---- tasks ----
      addTask: (input) => {
        const ts = now();
        const task: Task = {
          id: createId(),
          title: input.title.trim(),
          dueDate: input.dueDate ?? null,
          priority: input.priority ?? 'normal',
          completed: false,
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
      },

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: now() } : t,
          ),
        })),

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed, updatedAt: now() } : t,
          ),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      // ---- routines ----
      addRoutine: (name, schedule) => {
        const id = createId();
        const ts = now();
        const routine: Routine = {
          id,
          name: name.trim(),
          schedule,
          steps: [],
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ routines: [...s.routines, routine] }));
        return id;
      },

      updateRoutine: (id, patch) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: now() } : r,
          ),
        })),

      deleteRoutine: (id) =>
        set((s) => ({ routines: s.routines.filter((r) => r.id !== id) })),

      toggleRoutineStepToday: (routineId, stepId) => {
        const today = todayIso();
        set((s) => ({
          routineProgress: {
            ...s.routineProgress,
            [routineId]: toggleRoutineStep(
              s.routineProgress[routineId],
              today,
              stepId,
            ),
          },
        }));
      },

      // ---- workouts ----
      setTodaysWorkout: (workoutId) =>
        set({ todaysWorkout: { workoutId, date: todayIso() } }),

      completeWorkout: (workoutId, exercisesCompleted) => {
        const workout = get().workouts.find((w) => w.id === workoutId);
        if (!workout) return;
        set((s) => ({
          workoutHistory: [
            {
              id: createId(),
              workoutId,
              workoutName: workout.name,
              completedAt: now(),
              exercisesCompleted,
              exercisesTotal: workout.exercises.length,
            },
            ...s.workoutHistory,
          ],
        }));
      },
    }),
    {
      name: 'app-data',
      version: CURRENT_VERSION,
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => pickData(state as AppState),
      migrate: (persisted) => runMigrations(persisted) as unknown as AppState,
      onRehydrateStorage: () => (state) => {
        state?._setHydrated();
      },
    },
  ),
);

// Re-export helper types used by consumers.
export type { Exercise, Workout };
