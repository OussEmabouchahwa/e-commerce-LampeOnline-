---
trigger: always_on
description: Engineering standards that apply to every task in this repository
---
# Project standards
- **TypeScript strict**. No `any`, no `@ts-ignore` without a comment explaining why. Types shared through `packages/shared`.
- **API layers**: route → controller → service → repository. Controllers only parse and respond; business rules live in services; only repositories touch Prisma.
- **Validation** of every request with the shared Zod schema. Errors go through one central error handler with a stable shape `{ error: { code, message, details? } }`.
- **Money** is stored as integer millimes (TND has 3 decimals). Never use floats for prices.
- **Clean code**: small functions, meaningful names, no dead code, no commented-out code, no `console.log` (use the logger), no duplicated logic.
- **Git**: Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`), one logical change per commit.
- **Dependencies**: add one only when justified in the plan; pin versions older than 14 days; no unmaintained packages.
- **Definition of done** for any change: lint, typecheck, tests and build pass; new behavior has a test; docs updated if behavior or setup changed.
- **Honesty**: never claim something works without running it. If you could not verify, say so.
