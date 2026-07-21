# Min Hverdag

A calm, warm, **local-first** personal life-management PWA — built for one
person on an iPhone. It helps you manage everyday life without collapsing
everything into one giant task list.

The model in one line:

> **Life areas → Tracks → Actions & ideas → one or two current focus tracks.**

All data lives on your device. No login, no backend, no cloud, no analytics.

## Features

- **Today** – today's routines, your 1–2 focus tracks (with next action + quick
  idea capture), up to three important general tasks, and today's workout.
- **Tasks** – standalone everyday tasks (title, due date, priority, complete),
  kept separate from track actions.
- **Tracks** – broad life threads (a person, a goal, a project, a hobby…) each
  with their own actions, ideas, type (ongoing/completable) and status. At most
  **two** may be focus tracks.
- **Routines** – reusable checklists (morning, evening, weekly, packing) with
  per-day completion.
- **Workouts** – a small workout library, pick/change today's workout, step
  through exercises, complete, and see basic history.
- **Backup** – export all data as JSON, and import/validate a backup (with a
  clear replace warning). The format is versioned for future migrations.
- **Installable PWA** – works standalone on iPhone and offline.

## Tech stack

React · TypeScript · Vite · Zustand · IndexedDB (`idb`) · `vite-plugin-pwa` ·
Vitest · React Router (hash routing). Deployed to GitHub Pages via GitHub
Actions.

## Getting started

```bash
npm install
npm run dev        # start the dev server
```

Open the printed URL. Realistic seed data is installed automatically on first
run (only when no user data exists).

### Scripts

| Command             | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Vite dev server                                     |
| `npm run build`     | Type-check + production build (to `dist/`)          |
| `npm run preview`   | Preview the production build locally                |
| `npm run test`      | Run the Vitest suite once                           |
| `npm run test:watch`| Watch mode                                          |
| `npm run lint`      | ESLint                                              |
| `npm run typecheck` | TypeScript, no emit                                 |
| `npm run icons`     | Regenerate PWA icons in `public/`                   |
| `npm run check`     | typecheck + lint + test + build (what CI runs)      |

## Documentation

- [`docs/PRODUCT.md`](docs/PRODUCT.md) – the approved product model and v1 scope.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) – modules, state, persistence,
  routing, PWA, deployment.
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) – stored entities and the backup
  schema.
- [`docs/ui-reference/`](docs/ui-reference/) – the original static design
  prototype the app is based on.
- [`AGENTS.md`](AGENTS.md) / [`CLAUDE.md`](CLAUDE.md) – pointers for coding
  agents.

## Deployment

Pushing to `main` builds and deploys to GitHub Pages (see
`.github/workflows/deploy.yml`). The app is served from `/the-one-app/`; the
base path is configured in `vite.config.ts` and must match the repository name.

## Privacy

Everything is stored locally in your browser's IndexedDB. Nothing leaves your
device. Export a backup regularly so you don't lose data if you clear browser
storage or switch devices.
