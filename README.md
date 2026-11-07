# LampeOnline

Interactive e-commerce platform for indoor lamps and accessories. Visitors explore a 3D lamp showroom, clients buy and keep a wishlist, admins manage the shop and read visit and sales statistics.

> Payments are **simulated**. Google sign-in works with a real Google Client ID, and falls back to a clearly labelled mock in development.

## Features
- Visitor, Client and Admin roles with route and API protection
- Catalog with search, filters, sorting, pagination (state kept in the URL)
- 3D product viewer, light on/off and warm-to-cool color temperature preview
- Wishlist (heart), cart (guest cart merged at sign-in), checkout, order tracking
- Admin: statistics (visits, unique visitors, conversion, revenue, top products), product CRUD, orders, clients
- Sign-up in one short form, or one click with Google

## Architecture
```
apps/web        React + Vite SPA
apps/api        Express REST API (routes -> controllers -> services -> repositories)
packages/shared Zod schemas and shared types
```

## Getting started
```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm db:migrate && pnpm db:seed
pnpm dev            # web on :5173, api on :4000
```
Seeded admin: see `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env.example` (change before any deployment).

## Scripts
| Script | Purpose |
|---|---|
| `pnpm dev` | Run web and API |
| `pnpm lint` / `pnpm typecheck` | Static checks |
| `pnpm test` | Unit, API and component tests |
| `pnpm e2e` | Playwright end-to-end tests |
| `pnpm build` | Production build |
| `pnpm db:migrate` / `pnpm db:seed` | Database |

## Environment variables
`DATABASE_URL`, `JWT_SECRET`, `COOKIE_DOMAIN`, `GOOGLE_CLIENT_ID` (optional), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `PAYMENT_PROVIDER=mock`.

## Project method
Built with Scrum: see `docs/SPEC.md` (backlog, user stories, sprint plan).
