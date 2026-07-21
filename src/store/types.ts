// Central data model for Min Hverdag.
//
// The entire application state is a single serialisable document (`AppData`).
// This keeps persistence, export/import and migrations trivial: the exported
// JSON *is* the document. See docs/DATA_MODEL.md.

/** Fixed set of life areas. Not user-editable in v1. */
export type LifeAreaId = 'family' | 'social' | 'health' | 'work' | 'hobby';

export interface LifeArea {
  id: LifeAreaId;
  /** Danish label shown in the UI. */
  name: string;
}

export type TrackType = 'ongoing' | 'completable';
export type TrackStatus = 'active' | 'paused' | 'archived';

export interface TrackAction {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Idea {
  id: string;
  text: string;
  createdAt: string;
}

export interface Track {
  id: string;
  name: string;
  lifeArea: LifeAreaId;
  type: TrackType;
  status: TrackStatus;
  /** Whether this track is one of the current focus tracks (max two). */
  focus: boolean;
  /** Optional id of the action considered the next concrete step. */
  nextActionId: string | null;
  actions: TrackAction[];
  ideas: Idea[];
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'low' | 'normal' | 'high';

/** A standalone everyday task. Deliberately separate from track actions. */
export interface Task {
  id: string;
  title: string;
  /** ISO date (YYYY-MM-DD) or null. */
  dueDate: string | null;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RoutineSchedule = 'morning' | 'evening' | 'weekly' | 'reusable';

export interface RoutineStep {
  id: string;
  text: string;
}

export interface Routine {
  id: string;
  name: string;
  schedule: RoutineSchedule;
  steps: RoutineStep[];
  createdAt: string;
  updatedAt: string;
}

/** Per-day completion state for a routine, scoped to a single calendar date. */
export interface RoutineProgress {
  /** ISO date (YYYY-MM-DD) the progress applies to. */
  date: string;
  completedStepIds: string[];
}

export type WorkoutCategory = 'speediance' | 'bodyweight' | 'mobility';

export interface Exercise {
  id: string;
  name: string;
  sets: number | null;
  reps: number | null;
  /** Duration of a working set in seconds, when time-based. */
  durationSeconds: number | null;
  restSeconds: number | null;
  note: string | null;
}

export interface Workout {
  id: string;
  name: string;
  category: WorkoutCategory;
  description: string | null;
  estimatedMinutes: number;
  exercises: Exercise[];
}

/** A completed workout, for basic history. */
export interface WorkoutSession {
  id: string;
  workoutId: string;
  workoutName: string;
  /** ISO datetime the workout was completed. */
  completedAt: string;
  exercisesCompleted: number;
  exercisesTotal: number;
}

/** Today's chosen workout, valid only for the given date. */
export interface TodaysWorkout {
  workoutId: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
}

export interface Settings {
  /** User's display name, used in greetings. */
  userName: string;
}

/**
 * The complete persisted document. `version` enables forward migrations.
 */
export interface AppData {
  version: number;
  lifeAreas: LifeArea[];
  tracks: Track[];
  tasks: Task[];
  routines: Routine[];
  routineProgress: Record<string, RoutineProgress>;
  workouts: Workout[];
  workoutHistory: WorkoutSession[];
  todaysWorkout: TodaysWorkout | null;
  settings: Settings;
  /** True once seed data has been installed (prevents re-seeding). */
  seeded: boolean;
}
