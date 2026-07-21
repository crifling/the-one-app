# Product – Min Hverdag

## Purpose

Min Hverdag is a personal, local-first PWA for one person on an iPhone. It helps
the user manage everyday life **without mixing everything into one large task
list**. Structure and a gentle sense of balance come first; it is deliberately
*not* a productivity tracker or a gamified system.

## Product model

```
Life areas  →  Tracks  →  Actions & ideas  →  One or two current focus tracks
```

### Life areas

A small, fixed set that provides organisation and a gentle overview of balance:

- Familie (Family)
- Socialt (Social)
- Sundhed (Health)
- Arbejde (Work)
- Hobby

Life areas are **not** a scoring or gamification system. They are not
user-editable in v1.

### Tracks

A **track** is deliberately broader than a project. It may represent a person or
relationship, an ongoing responsibility, a hobby, a goal, a temporary project, a
development project, or something that may never be completed.

Each track has: name; life area; **type** (`ongoing` | `completable`); **status**
(`active` | `paused` | `archived`); its own **actions**; its own **ideas/notes**;
an optional **next action**; and a **focus** flag.

Rules:

- **No more than two tracks** may be current focus tracks at any time.
- **Track actions are never mixed into the general task list.** They live only
  inside their track.

### Focus tracks

Only one or two tracks are "in focus" at a time. Focus tracks are surfaced on the
Today screen with their next action and a quick way to save an idea.

## Navigation

Bottom navigation, optimised for iPhone: **Today · Tasks · Workouts · Routines ·
Tracks**. Settings/backup is reachable from the top bar.

## Screens

### Today (calm, not a dashboard)

In order:

1. Today's routines (with completion state).
2. The current one or two focus tracks — each with next action and quick idea
   capture.
3. Up to three important general tasks.
4. Today's workout, with clear **Start** and **Change** buttons.

### General tasks

Standalone everyday tasks, separate from track actions: title, optional due date,
priority, completed state. Create, edit, complete, delete.

### Routines

Reusable checklists (morning, evening, weekly review, reusable packing list). A
routine is a set of reusable steps. Daily routines and their completion state
appear on Today; completion resets each day.

### Workouts

A simple but usable module: workout library; details; select/change today's
workout; start; step through exercises; complete; basic history. A workout has
exercises with sets, reps, duration and optional rest. No advanced statistics in
v1.

## Data & privacy

Local-first: no login, no backend, no cloud database, no analytics, no account,
no external services. All data survives closing and reopening the app.

- Export all data as JSON.
- Import + validate a JSON backup, with a clear warning before it **replaces**
  current data.
- The exported format carries a **version number** so migrations can be added
  later.

Realistic seed data is installed **only when no user data exists**, demonstrating
two focus tracks (Min Hverdag-app, Bali), other tracks (Echoes of Varik, Health,
My daughters, My partner), general tasks, routines, and bodyweight + Speediance
workouts.

## Design direction

Calm, warm, uncluttered, slightly premium. Large iPhone-friendly touch targets,
cards with generous spacing, muted warm background, dark green as the primary
accent, and a clear visual distinction between general tasks, routines, workouts
and tracks. The UI language is Danish. Accessibility: sufficient contrast,
semantic controls, visible focus states, usable text sizing, and respect for
reduced-motion settings.

## Explicitly out of scope for v1

- Multi-user / accounts / sync across devices.
- Advanced workout statistics and charts.
- Editable life areas, custom themes.
- Notifications / reminders.
- Any plugin framework, workflow engine, event bus or DI system.
