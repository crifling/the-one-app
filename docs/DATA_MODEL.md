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
| `workouts`        | `Workout[]`                       | Workout library.                                 |
| `workoutHistory`  | `WorkoutSession[]`                | Completed workouts (most recent first).          |
| `todaysWorkout`   | `TodaysWorkout \| null`           | Selection, valid only for its `date`.            |
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

### Workout / Exercise
```
Workout:  id, name, category: 'speediance' | 'bodyweight' | 'mobility',
          description: string | null, estimatedMinutes, exercises: Exercise[]
Exercise: id, name, sets|null, reps|null, durationSeconds|null,
          restSeconds|null, note|null
```

### WorkoutSession (history)
`id, workoutId, workoutName, completedAt (ISO datetime), exercisesCompleted,
exercisesTotal`.

### TodaysWorkout
`{ workoutId, date: 'YYYY-MM-DD' }`. Resolved to a workout only when `date` is
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
- Migration **0 → 1** establishes the baseline shape, filling any missing
  collections with defaults and refreshing the built-in life areas while
  preserving existing user data.

### Adding a future migration

1. Bump `CURRENT_VERSION` (e.g. to `2`).
2. Add `MIGRATIONS[1] = (data) => ({ ...data, version: 2, /* transform */ })`.
3. Add a test in `migrations.test.ts` proving an old document upgrades correctly.

Both the persisted store (on rehydrate) and backup import run through the same
`runMigrations`, so old on-device data and old backup files are handled
identically.
