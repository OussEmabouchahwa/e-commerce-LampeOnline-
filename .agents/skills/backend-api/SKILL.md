---
name: backend-api
description: Build and change the Express + Prisma REST API of LampeOnline (routes, controllers, services, repositories, validation, errors, transactions). Use for any task touching apps/api or the database schema.
---
# Backend API
## Steps
1. Add or update the Zod schema in `packages/shared` first; export the inferred type.
2. Route → controller → service → repository. Controllers stay thin. Services hold rules (stock, totals, status transitions). Repositories are the only code that imports Prisma.
3. Money in integer millimes. Totals recomputed on the server.
4. **Checkout is one `prisma.$transaction`**: validate stock, decrement stock, create order + items (with name and price snapshots), create payment, honor the idempotency key (same key returns the same order).
5. Status transitions are an explicit table (PENDING→PAID→SHIPPED→DELIVERED, any→CANCELLED before SHIPPED). Cancelling restores stock. Reject illegal transitions with 409.
6. Lists are paginated (`page`, `pageSize` max 50), filterable, sortable; add DB indexes for every filter used.
7. Errors: throw typed `AppError(code, status, message)`; one central handler formats the response.
8. Write a migration, update the seed, add API tests (Supertest) for success, validation error, 401, 403, 404.
## Check before finishing
Run `/verify`. Confirm no controller imports Prisma and no route lacks auth/role middleware where required.
