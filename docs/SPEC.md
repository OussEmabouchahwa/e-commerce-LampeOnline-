# LampeOnline — Functional Specification

## 1. Roles and permissions
| Capability | Visitor | Client | Admin |
|---|---|---|---|
| Browse, search, filter, 3D view | yes | yes | yes |
| Local cart | yes | yes (server cart) | n/a |
| Checkout, wishlist, orders | no (sign-in prompt) | yes | n/a |
| Account panel `/account` | no | yes | no |
| Admin panel `/admin` | no | no | yes |

A blocked client cannot sign in. Admin is created by seed only, never through public sign-up.

## 2. Key flows
- **Buy as visitor**: add to cart → checkout → auth modal (sign-in, sign-up or Google) → return to checkout with cart intact.
- **Sign-up form** (short): full name, email, password (min 8). Phone and address are asked at checkout, not before.
- **Google**: Google Identity Services returns an ID token; the API verifies it, creates or links the user (name, email, avatar). If `GOOGLE_CLIENT_ID` is missing in dev, show a visible "Dev mock Google account" button.
- **Checkout**: address → payment method (mock card, cash on delivery) → confirmation. Mock card: `4242 4242 4242 4242` succeeds, `4000 0000 0000 0002` fails, `4000 0000 0000 3220` simulates a 3-second extra verification step. Order creation is a DB transaction (stock check + decrement + order + payment) with an idempotency key.
- **Order status**: PENDING → PAID → SHIPPED → DELIVERED, or CANCELLED (stock restored).

## 3. Client panel `/account`
Overview (greeting, last order, wishlist preview), Orders (status timeline), Wishlist (hearted products shown as a grid with quick add-to-cart and price-drop badge), Profile (name, phone, addresses, password).

## 4. Admin panel `/admin`
- **Dashboard**: visits, unique visitors, sign-ups, orders, revenue, conversion funnel (visit → product view → cart → purchase), period selector (7/30/90 days), top products, low-stock list.
- **Products**: table with search, create/edit drawer, image upload, price (TND, stored in millimes), stock, category, active toggle, 3D parameters (shade shape, colors, color temperature), delete = archive.
- **Orders**: filter by status, detail view, change status, export CSV.
- **Clients**: list, search, detail (orders, total spent), block/unblock.

## 5. Data model (Prisma)
`User(id, email, passwordHash?, googleId?, name, avatarUrl?, phone?, role, status, createdAt)` · `Category(id, slug, name)` · `Product(id, slug, name, description, priceMillimes, stock, categoryId, images[], model3d JSON, isActive, createdAt)` · `WishlistItem(userId, productId)` · `CartItem(userId, productId, qty)` · `Order(id, userId, status, totalMillimes, paymentMethod, paymentStatus, shippingAddress JSON, idempotencyKey, createdAt)` · `OrderItem(orderId, productId, nameSnapshot, priceSnapshot, qty)` · `Payment(id, orderId, provider, status, reference)` · `PageView(id, visitorId, userId?, path, referrer?, createdAt)`.

## 6. API (all under `/api`, validated with shared Zod schemas)
`POST /auth/register|login|google|logout`, `GET /auth/me` · `GET /products`, `GET /products/:slug` · `GET|POST|DELETE /wishlist` · `GET|PUT /cart` · `POST /orders`, `GET /orders`, `GET /orders/:id` · `POST /analytics/visit` · Admin only: `GET /admin/stats`, `CRUD /admin/products`, `GET|PATCH /admin/orders`, `GET|PATCH /admin/clients`.

## 7. Analytics rules
Anonymous `visitorId` in a first-party cookie, no IP stored, bots ignored, one visit per session per path per 30 min. Funnel events: `product_view`, `add_to_cart`, `checkout_start`, `purchase`.

## 8. Suggested extras (agent may propose, with cost)
Recommendations ("goes well with"), free-shipping progress bar, coupons, product reviews, recently viewed, low-stock alerts for admin, Arabic (RTL) + French, order e-mail templates, PWA install.

## 9. Scrum plan
- **Sprint 0**: vision, backlog, user stories, Planning Poker estimates, design tokens, prototype of home and product page.
- **Sprint 1**: auth, catalog, product page, wishlist, cart.
- **Sprint 2**: checkout + mock payment, client panel, admin products/orders/clients, statistics.
- **Sprint 3**: no new features: refactoring, tests, performance, accessibility, documentation.
Each user story has acceptance criteria, moves through To do → In progress → To verify → Done, and a burndown is updated daily.
