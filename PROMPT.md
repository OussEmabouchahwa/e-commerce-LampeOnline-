# MAIN PROMPT — paste this into the Antigravity agent chat (Planning mode)

You are a senior full-stack engineer, software architect and product designer. Build **LampeOnline**, a complete e-commerce web application for indoor lamps and accessories (market: Tunisia, currency TND).

## Before writing any code
1. Read, in this order: `docs/SPEC.md`, `docs/DESIGN_SYSTEM.md`, everything in `.agents/rules/`, then the skills in `.agents/skills/`.
2. Produce a **plan** (architecture, folder tree, phases, risks, assumptions). Wait for my approval of the plan.
3. Ask me a question only if something blocks you. Otherwise state the assumption in one line and continue.

## Product in one paragraph
Visitors browse a spectacular, interactive lamp showroom. To buy, they must sign in (email form or Google). Clients have a personal panel (orders, wishlist hearts, profile). Admins run the shop from an admin panel (products, orders, clients, statistics on visits and purchases). Payment is **simulated** behind a provider interface so a real gateway can be plugged in later.

## Three actors
- **Visitor** — no account: browse, search, filter, view product (with 3D viewer), add to a local cart, see prices. Cannot check out: the checkout step opens sign-in/sign-up and returns to the same place afterwards.
- **Client** — signed in: everything above + checkout, wishlist, order history and tracking, profile, addresses.
- **Admin** — `/admin`: dashboard statistics, product CRUD (images, stock, price, 3D model parameters, active flag), order management (status changes), client management (list, search, block/unblock, see their orders).

## Stack (fixed unless you justify a change in the plan)
pnpm monorepo: `apps/web` (React 18 + TypeScript + Vite + Tailwind + Framer Motion + React Three Fiber + TanStack Query + React Router + React Hook Form + Zod + Recharts), `apps/api` (Node 20 + Express + TypeScript + Prisma + SQLite in dev / PostgreSQL in prod + Zod + JWT in httpOnly cookies), `packages/shared` (Zod schemas and types shared by both sides).

## Phases (verify with `/verify` after each, then summarize in 5 lines)
1. **Foundation** — monorepo, tooling (ESLint, Prettier, strict TS), Prisma schema, seed (admin + 20 products + demo orders/visits).
2. **Backend core** — auth (email + Google), products, categories, wishlist, cart, orders, payment provider (mock), analytics endpoints.
3. **Design system + storefront** — tokens, components, home, catalog (search/filter/sort/pagination in the URL), product page.
4. **Client experience** — auth screens, cart drawer, checkout with mock payment, client panel, wishlist.
5. **Admin panel** — dashboard charts, product CRUD, orders, clients.
6. **3D and motion polish** — hero lamp, light-on interaction, tilt cards, add-to-cart and heart animations, page transitions. Performance budget respected.
7. **Hardening** — tests (unit, API, component, Playwright E2E), accessibility pass, security pass, README final.

## Definition of done
`pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass with zero warnings; E2E covers visitor→sign-up→purchase and admin→create product; screenshots reviewed at 375, 768 and 1280 px; no hardcoded colors; no `any`; no `console.log`; no secrets committed; README matches reality.

## Things I want you to bring yourself
If you know a feature that makes clients buy more or makes the admin's life easier, and it fits the scope in `docs/SPEC.md` section "Suggested extras", propose it in the plan with its cost. Do not add dark patterns (fake urgency, fake stock, hidden fees).
