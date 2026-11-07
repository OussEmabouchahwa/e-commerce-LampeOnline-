---
name: frontend-ui
description: Build the React + TypeScript + Tailwind interface of LampeOnline (storefront, client panel, admin screens, forms, state, routing). Use for any task touching apps/web outside pure 3D scenes.
---
# Frontend UI
1. Read `docs/DESIGN_SYSTEM.md`. Build or reuse a component in `components/ui` before writing page-specific markup.
2. Server state with TanStack Query; URL state for catalog filters, sort and page (shareable links); local state only for UI.
3. Forms: React Hook Form + the shared Zod schema. Errors under the field, focus the first invalid field, disable submit while pending.
4. Every data view has loading (skeleton), empty, error (with retry) and success states.
5. Route-level code splitting; admin and Three.js are lazy chunks. Images have width/height, `loading="lazy"`, and `srcset`.
6. Optimistic updates for wishlist hearts with rollback on error.
7. Accessibility: semantic HTML, labels, `aria-live` for toasts, focus trap in modals/drawers, Escape closes, focus returns to the trigger.
8. Copy follows the design system (plain verbs, same action name everywhere). Prices formatted with `Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' })`.
9. Finish with the `design-review` skill: screenshots at 375, 768, 1280 px, light and dark.
