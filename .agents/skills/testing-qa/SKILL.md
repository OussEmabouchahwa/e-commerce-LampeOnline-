---
name: testing-qa
description: Write and run the tests of LampeOnline (Vitest unit, Supertest API, React Testing Library component, Playwright E2E, accessibility checks). Use whenever behavior changes or before declaring a phase done.
---
# Testing and QA
- **Unit** (Vitest): services, price/total math, status transitions, color-temperature mapping, payment provider.
- **API** (Supertest, test database): success, validation 400, 401, 403, 404, 409 for each route; ownership checks; idempotent checkout; stock never negative under two concurrent orders.
- **Components** (React Testing Library): forms, cart drawer, heart button, auth modal, product filters in URL.
- **E2E** (Playwright, 3 viewports): visitor browses → adds to cart → is asked to sign in → signs up → pays with `4242…` → sees order; failed card keeps cart; client hearts a product and finds it in the panel; admin creates a product and sees it in the shop; admin blocks a client who then cannot sign in; admin dashboard shows the new order.
- **Accessibility**: axe checks on home, product, checkout, account, admin dashboard; keyboard-only walkthrough of checkout.
- A test must fail for the right reason before it passes. Do not weaken or delete a test to make it green: fix the code or explain in the summary.
- Report real command output (counts of passed tests), not "all good".
