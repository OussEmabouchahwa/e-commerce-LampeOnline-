# LampeOnline — Design System

## Concept
A lamp showroom at dusk. **Light is the single memorable idea**: the interface is calm and quiet, and light appears where the user acts (hero lamp, cursor glow, "turn on" toggle on product pages). Everything else stays disciplined.

## Tokens (CSS variables, mapped in Tailwind theme; never hardcode colors)
| Token | Light | Dark (showroom) | Use |
|---|---|---|---|
| `--bg` | #EEF1F4 | #0F141B | page |
| `--surface` | #FFFFFF | #1A222C | cards, panels |
| `--ink` | #1B2430 | #ECEFF3 | text |
| `--mute` | #5B6673 | #9AA6B3 | secondary text |
| `--line` | #D5DCE3 | #2E3946 | borders |
| `--teal` | #2F5D62 | #7FB5B9 | primary actions |
| `--bulb` | #F5B642 | #F5B642 | light, focus ring, wishlist heart, highlights |
| `--danger` / `--ok` | #B3261E / #2E7D4F | #F2877E / #6CC48F | states |
Contrast: body text 4.5:1 minimum, large text 3:1. Dark mode is designed, not inverted.

## Typography
Headings: **Bricolage Grotesque** 700–800, tight tracking. Body and UI: **Figtree** 400–600. Scale (rem): 0.875, 1, 1.125, 1.5, 2, 3, 4.5. Body line length under 70 characters. Sentence case everywhere.

## Space, shape, depth
4-px grid (4, 8, 12, 16, 24, 32, 48, 80). Radius scale by role: input 8, card 14, modal 20, pill 999. Shadows are two levels only and tinted with `--ink`. Depth in 3D comes from perspective and light, not from heavy shadows.

## Components (each with default, hover, focus, active, disabled, loading, error)
Button (primary, secondary, ghost, danger) · IconButton · Input · Select · Checkbox · Switch · Slider · Chip · Badge · Card (ProductCard, StatCard) · Modal/Drawer · Toast · Tabs · Table (sortable, empty, loading) · Pagination · Skeleton · EmptyState · ErrorState · Stepper · Timeline (order status) · HeartButton · QuantityStepper · ColorTempSlider.

## Signature interactions
1. **Hero lamp (3D)**: a procedural lamp (React Three Fiber) follows the cursor slightly; clicking it turns it on and the page palette warms. Mobile: tilt via device orientation if permitted, otherwise tap only.
2. **Cursor light**: a soft radial glow follows the pointer on dark sections only (CSS variable updated with `requestAnimationFrame`).
3. **Product page**: drag-to-rotate 3D viewer, light on/off, color temperature slider 2700K–6500K that really changes the light color.
4. **ProductCard tilt**: max 6° perspective tilt on hover (pointer devices only).
5. **Add to cart**: the product thumbnail flies to the cart icon (300–450 ms). **Heart**: fills with a small amber burst (250 ms).
6. **Page transitions**: shared-element transition from card image to product page (Framer Motion `layoutId`), 250 ms.
7. **Admin**: numbers count up once on first load; charts draw in once.

## Motion rules
Durations 150–450 ms, ease-out for entrances, ease-in-out for moves. Motion responds to user action; at most one automatic motion per screen (the hero). `prefers-reduced-motion`: disable tilt, fly-to-cart, count-up and auto-rotation; keep instant state changes.

## 3D performance budget
Three.js is lazy-loaded; canvas only on home hero and product page. Procedural geometry (no heavy model files), at most 50k triangles per scene, `dpr` capped at 2, pause rendering when off-screen or tab hidden, static image fallback when WebGL is unavailable, on low-end devices or with reduced motion. Largest Contentful Paint under 2.5 s on mid-range mobile.

## Layout
Storefront: max width 1200 px, 12 columns, left-aligned text, generous whitespace around the hero. Admin: fixed sidebar (collapses to bottom bar on mobile), dense but readable tables. Client panel: top tabs, wishlist as the visual centerpiece.

## Accessibility
Keyboard reachable everywhere with a visible 3 px `--bulb` focus ring; semantic landmarks; labels on all inputs; errors announced with `aria-live`; 3D canvas has a text alternative and every 3D action has a button equivalent; touch targets at least 44 px.

## Copy
Plain verbs, active voice, same name for the same action everywhere ("Add to cart" → toast "Added to cart"). Errors say what happened and how to fix it, without apologizing. Empty states invite an action.

## Forbidden
Cream background with terracotta accent; black background with neon green; purple-to-blue gradients; identical rounded cards with the same shadow everywhere; ALL-CAPS tracked eyebrow above every heading; one word accented in every headline; numbered 01/02/03 markers on non-sequences; stock photos of people; fake urgency ("3 people are viewing this"), fake stock counters, emoji as icons, Lorem ipsum, `localhost` or test data visible in production screens.
