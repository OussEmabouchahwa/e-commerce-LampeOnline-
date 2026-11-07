---
description: Add a feature the disciplined way (spec, shared schema, API, UI, tests)
---
1. Write the user story and acceptance criteria in 5 lines; add it to `docs/SPEC.md` if it changes scope.
2. Add or update the shared Zod schema.
3. Implement API (`backend-api` skill) with tests.
4. Implement UI (`frontend-ui` skill), with all states.
5. Add an E2E scenario if it is a user flow.
6. Run `/verify` and `/review-design`, then summarize in 5 lines.
