---
description: Run all quality checks and report real results
---
1. Run `pnpm install --frozen-lockfile`.
2. Run `pnpm lint` and fix every warning.
3. Run `pnpm typecheck`.
4. Run `pnpm test` and show the passed/failed counts.
5. Run `pnpm build` and show the bundle sizes against the budget in `docs/DESIGN_SYSTEM.md`.
6. Run `pnpm e2e` when the phase includes user flows.
7. Report: what passed, what failed, what you could not run and why. Never write "all good" without the output.
