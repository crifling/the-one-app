# Claude Code guide – Min Hverdag

All shared guidance for coding agents lives in **[`AGENTS.md`](AGENTS.md)** so
there is a single source of truth. Please read it, then follow the linked docs:

- [`AGENTS.md`](AGENTS.md) – golden rules, where things live, workflow.
- [`docs/PRODUCT.md`](docs/PRODUCT.md) – product model & scope.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) – architecture.
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) – data & backup schema.

Quick reminder of the non-negotiables (details in `AGENTS.md`): local-first only;
at most two focus tracks; track actions ≠ general tasks; keep it simple; version
the data with a migration + test; run `npm run check` before committing.
