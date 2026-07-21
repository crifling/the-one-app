# Data Model – Min Hverdag

All application state is a single serialisable document, `AppData`, defined in
`src/store/types.ts`. The exported backup **is** this document. This page
describes the stored entities and the backup schema.

## Top-level document (`AppData`)

| Field             | Type                              | Notes                                            |
| ----------------- | --------------------------------- | ------------------------------------------------ |
| `version`         | `number`                          | Schema version (currently **1**).                |
| `lifeAreas`       | `LifeArea[]`                      | Fixed built-in set; always overwritten on migrate.|
| `tracks`          | `Track[]`                         | Life threads with their own actions & ideas.     |
| `tasks`           | `Task[]`                          | General standalone tasks only.                   |
| `routines`        | `Routine[]`                       | Reusable checklists.                             |
| `routineProgress` | `Record<routineId, RoutineProgress>` | Per-day completion, keyed by routine id.      |
| `exercises`       | `Exercise[]`                      | Reusable exercise library.                       |
| `programs`        | `Program[]`                       | Reusable training programs (ordered steps).      |
| `sessions`        | `WorkoutSession[]`                | Completed programs (most recent first).          |
| `todaysProgram`   | `TodaysProgram \| null`           | Selection, valid only for its `date`.            |
| `settings`        | `Settings`                        | e.g. `userName`.                                 |
| `seeded`          | `boolean`                         | True once seed data has been installed.          |

## Entities

### LifeArea
`id: 'family' | 'social' | 'health' | 'work' | 'hobby'`, `name: string`.
Fixed and not user-editable in v1.

### Track
```
id, name, lifeArea (LifeAreaId),
type: 'ongoing' | 'completable',
status: 'active' | 'paused' | 'archived',
focus: boolean,                 // at most two tracks may be true (enforced)
nextActionId: string | null,    // optional; falls back to first open action
actions: TrackAction[],         // NEVER stored in `tasks`
ideas: Idea[],
createdAt, updatedAt            // ISO datetime
```

### TrackAction
`id, title, completed, createdAt, updatedAt`. Belongs to exactly one track.

### Idea
`id, text, createdAt`. A free-text idea/note on a track.

### Task (general task)
```
id, title,
dueDate: string | null,         // ISO date YYYY-MM-DD
priority: 'low' | 'normal' | 'high',
completed, createdAt, updatedAt
```
General tasks are **disjoint** from track actions (verified by tests).

### Routine
```
id, name,
schedule: 'morning' | 'evening' | 'weekly' | 'reusable',
steps: RoutineStep[],           // { id, text }
createdAt, updatedAt
```
`morning`/`evening` are the daily routines surfaced on Today.

### RoutineProgress
`{ date: 'YYYY-MM-DD', completedStepIds: string[] }`. Progress applies to a
single day; a new day resets completion (progress from other dates is ignored).

### Exercise (library)
A reusable definition. Reps/sets/weight are **not** stored here — they belong to
how the exercise is used in a program, so the same exercise can be 3×10 in one
program and 5×5 in another.
```
id, title, category: 'speediance' | 'bodyweight' | 'mobility',
bodyPart: BodyPartId, createdAt, updatedAt
```
`BodyPartId` is a fixed set: `legs, core, back, chest, shoulders, arms, glutes,
fullbody, cardio`.

### Program + steps
A program is an ordered, flat list of steps. A step is either an **exercise**
(with its dosage) or a **pause**. Keeping it flat means groupings such as
supersets can be layered on later without another migration.
```
Program:      id, title, steps: ProgramStep[], createdAt, updatedAt
ProgramStep = ExerciseStep | PauseStep
ExerciseStep: id, kind:'exercise', exerciseId, sets,
              mode: 'reps' | 'time', amount (reps or seconds per set),
              restSeconds (between sets), weightKg (0 = none)
PauseStep:    id, kind:'pause', seconds
```
**Weight** (`weightKg`) is only meaningful for *weight-capable* categories —
currently Speediance only (see `WEIGHT_CATEGORIES` in
`features/workouts/logic.ts`); free weights / machines can be added there later.

### WorkoutSession (history)
`id, programId, programName, completedAt (ISO datetime), exercisesCompleted,
exercisesTotal`.

### TodaysProgram
`{ programId, date: 'YYYY-MM-DD' }`. Resolved to a program only when `date` is
today; otherwise treated as "nothing selected".

### Settings
`{ userName: string }`.

## Backup schema

A backup file is the JSON serialisation of `AppData`, pretty-printed:

```json
{
  "version": 1,
  "lifeAreas": [ ... ],
  "tracks": [ ... ],
  "tasks": [ ... ],
  "routines": [ ... ],
  "routineProgress": { ... },
  "workouts": [ ... ],
  "workoutHistory": [ ... ],
  "todaysWorkout": null,
  "settings": { "userName": "Claus" },
  "seeded": true
}
```

Filename: `min-hverdag-backup-<YYYY-MM-DD>.json`.

### Import validation (`validateBackup`)

An imported file is rejected if it: is not valid JSON; is not a JSON object;
lacks a numeric `version`; has a `version` **newer** than the app supports; or has
a required array field (`tracks`, `tasks`, `routines`, `workouts`,
`workoutHistory`) of the wrong type. On success the document is migrated to the
current version and returned; the UI then warns before **replacing** all current
data.

## Versioning & migrations

- `CURRENT_VERSION` lives in `src/store/defaults.ts`.
- `src/persistence/migrations.ts` holds an ordered map of migrations
  `N → N+1`. `runMigrations(doc)` reads the document's `version` (missing/unknown
  ⇒ treated as **0**) and applies each step until it reaches `CURRENT_VERSION`.
  Migrations are self-contained (they don't depend on the current default shape,
  which changes over time) so an old document always upgrades deterministically.
- Migration **0 → 1** establishes the baseline shape, filling any missing
  collections and refreshing the built-in life areas while preserving user data.
- Migration **1 → 2** splits the reusable exercise library out of workouts and
  turns each workout into a **program** of ordered steps. Old embedded exercises
  are de-duplicated into library exercises by `(category + title)`; each becomes
  an exercise step (mapping `durationSeconds → time`, else `reps`), `weightKg`
  defaults to 0, and `bodyPart` defaults to `fullbody` (refinable later).
  `todaysWorkout`/`workoutHistory` are carried over to `todaysProgram`/`sessions`
  and the obsolete v1 fields are dropped. Covered by tests in
  `migrations.test.ts`.

### Adding a future migration

1. Bump `CURRENT_VERSION` (e.g. to `2`).
2. Add `MIGRATIONS[1] = (data) => ({ ...data, version: 2, /* transform */ })`.
3. Add a test in `migrations.test.ts` proving an old document upgrades correctly.

Both the persisted store (on rehydrate) and backup import run through the same
`runMigrations`, so old on-device data and old backup files are handled
identically.
