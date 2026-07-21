# UI Reference

Design references for **Min Hverdag** (The One App). These are static, self-contained
prototypes used to communicate the intended look, layout, and navigation flow. They are
reference material only — not production code.

## Prototypes

### `min-hverdag-prototype-v2.html`

Interactive high-fidelity mobile prototype (v2). A single self-contained HTML file
(inline CSS, no build step, no external dependencies). Open it directly in a browser —
resize to a narrow / mobile viewport for the intended layout (max width 430px).

Navigation between screens uses `:target` CSS, so tapping the bottom nav, cards, and
buttons switches screens without any JavaScript.

**Language:** Danish (`lang="da"`).

**Key screens (element `id`s):**

- `today` — I dag (home / daily overview: hero, routines, focus tracks, key tasks, workout)
- `tasks` — Opgaver (general tasks list with filters)
- `workouts` — Træning (workout library)
- `routines` — Rutiner (morning / evening / weekly / packing routines)
- `tracks` — Spor (focus areas: people, goals, projects, hobbies)
- `balance` — Balance across life areas (family, health, work, hobby, social)
- `track-*` — individual track detail screens (app, bali, health, daughters, etc.)
- `routine-*` — individual routine checklists
- `workout-*` / `exercise*` — workout detail and in-session exercise player

**Core concepts illustrated:**

- **Spor (tracks)** — life areas that can be people, relationships, goals,
  responsibilities, hobbies, or concrete projects. Only one or two are "in focus" at a time.
- **Fokus nu (focus now)** — the one or two tracks currently prioritized on the home screen.
- Separation between general tasks and track-specific actions.
- A calm balance indicator across life areas (deliberately not a scoring system).
