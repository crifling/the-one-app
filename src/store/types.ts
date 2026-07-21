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

/** Fixed body-part ids an exercise can target. */
export type BodyPartId =
  | 'legs'
  | 'core'
  | 'back'
  | 'chest'
  | 'shoulders'
  | 'arms'
  | 'glutes'
  | 'fullbody'
  | 'cardio';

export interface BodyPart {
  id: BodyPartId;
  name: string;
}

/**
 * A reusable exercise definition in the library. Reps/sets/weight are NOT
 * stored here — those belong to how the exercise is used inside a program, so
 * the same exercise can be 3×10 in one program and 5×5 in another.
 */
export interface Exercise {
  id: string;
  title: string;
  category: WorkoutCategory;
  bodyPart: BodyPartId;
  /**
   * Optional illustration shown when running a program. Either a bundled asset
   * path (built-in exercises) or a data URI (user-uploaded photo). Null = none.
   */
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

/** How a program step's effort is measured. */
export type StepMode = 'reps' | 'time';

/**
 * A single step inside a program. Either an exercise (with its dosage) or a
 * standalone pause. Kept as a flat, ordered list so groupings such as
 * supersets can be layered on later without another migration.
 */
export interface ExerciseStep {
  id: string;
  kind: 'exercise';
  exerciseId: string;
  sets: number;
  mode: StepMode;
  /** Reps per set when mode is 'reps', or seconds per set when 'time'. */
  amount: number;
  /** Rest between sets, in seconds. */
  restSeconds: number;
  /** Weight in kg; only meaningful for weight-capable categories. 0 = none. */
  weightKg: number;
}

export interface PauseStep {
  id: string;
  kind: 'pause';
  seconds: number;
}

export type ProgramStep = ExerciseStep | PauseStep;

/** An ordered, reusable training plan built from library exercises. */
export interface Program {
  id: string;
  title: string;
  steps: ProgramStep[];
  createdAt: string;
  updatedAt: string;
}

/** A completed program, for basic history. */
export interface WorkoutSession {
  id: string;
  programId: string;
  programName: string;
  /** ISO datetime the program was completed. */
  completedAt: string;
  exercisesCompleted: number;
  exercisesTotal: number;
}

/** Today's chosen program, valid only for the given date. */
export interface TodaysProgram {
  programId: string;
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
  /** Reusable exercise library. */
  exercises: Exercise[];
  /** Reusable training programs built from exercises. */
  programs: Program[];
  /** Completed program history (most recent first). */
  sessions: WorkoutSession[];
  todaysProgram: TodaysProgram | null;
  settings: Settings;
  /** True once seed data has been installed (prevents re-seeding). */
  seeded: boolean;
}
