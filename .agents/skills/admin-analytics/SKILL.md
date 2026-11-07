---
name: admin-analytics
description: Build the admin panel of LampeOnline: dashboard statistics (visits, purchases, conversion, revenue), product CRUD, order management, client management, visit tracking. Use for any /admin or analytics task.
---
# Admin panel and analytics
## Tracking
`POST /analytics/visit` and event endpoint with anonymous `visitorId` cookie. Ignore bots (user-agent check), dedupe per session/path/30 min, store no IP. Events: `product_view`, `add_to_cart`, `checkout_start`, `purchase`.
## Dashboard (`GET /admin/stats?range=7|30|90`)
KPIs with change versus the previous period: visits, unique visitors, new clients, orders, revenue, average order value, conversion rate. Charts (Recharts): visits and revenue per day, funnel, orders by status, top 5 products. Lists: low stock (≤ 5), latest orders. Aggregate in SQL, not in JavaScript loops; index `createdAt`.
## Sections
- **Products**: table (search, filter, sort, pagination), create/edit drawer with Zod validation, image upload, 3D parameter fields with live preview, active toggle, archive instead of hard delete when orders exist.
- **Orders**: status filter, detail, legal status transitions only, CSV export.
- **Clients**: search, detail with orders and total spent, block/unblock with confirmation. Admins cannot block themselves.
## Quality
Every table has skeleton, empty and error states and works at 1280 px and 375 px. Destructive actions need confirmation and are reversible when possible. Admin API routes are covered by 403 tests for non-admins.
