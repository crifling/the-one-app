# Agent guide – Min Hverdag

This is the shared entry point for coding agents (Codex, Claude Code, and
others). Keep instructions here so both `AGENTS.md` and `CLAUDE.md` stay in sync
— `CLAUDE.md` intentionally just points here.

## Read these first

- [`docs/PRODUCT.md`](docs/PRODUCT.md) – product model and v1 scope (source of truth).
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) – module boundaries, state, persistence, routing, PWA, deployment.
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) – entities, backup schema, migrations.
- [`README.md`](README.md) – overview and scripts.

## Golden rules (don't break these)

1. **Local-first.** No login, backend, cloud DB, analytics, accounts, or
   external network services. All data stays in the browser (IndexedDB).
2. **At most two focus tracks.** Enforce via `setTrackFocus` in
   `src/features/tracks/logic.ts` — never bypass it.
3. **Track actions are not general tasks.** Track actions live inside their
   track; `tasks` holds only general tasks. Keep them disjoint.
4. **Keep it simple.** No plugin framework, workflow engine, event bus, or DI
   layer. Prefer readable, domain-organised code.
5. **Version the data.** Any change to `AppData` shape needs a migration (bump
   `CURRENT_VERSION`, add a `MIGRATIONS` entry) and a test.
6. **Seed only when empty.** Seed data installs only when `seeded` is false.

## Where things live

- Domain rules: `src/features/*/logic.ts` (pure, unit-tested).
- State + actions: `src/store/store.ts`; derived reads: `src/store/selectors.ts`.
- Persistence/migrations/backup: `src/persistence/`.
- UI per domain: `src/features/<domain>/`; shared UI: `src/components/`.

## Workflow

```bash
npm install
npm run dev            # develop
npm run check          # typecheck + lint + test + build (run before committing)
```

- Add/adjust tests for any domain rule or persistence change. Important suites:
  focus limit, task/action separation, backup validation, migrations,
  persistence, today's-workout selection.
- UI copy is **Danish**; code, identifiers and docs are English.
- Match existing style; don't introduce new state/persistence patterns without a
  good reason (document it in `docs/ARCHITECTURE.md` if you do).
- Deployment base path is `/the-one-app/` in `vite.config.ts`; keep it in sync
  with the repo name.
