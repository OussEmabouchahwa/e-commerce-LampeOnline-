---
trigger: always_on
description: Security rules for auth, data, payments and uploads
---
# Security rules
- Passwords hashed with argon2id (or bcrypt cost 12+). Never log passwords, tokens or card data.
- JWT in **httpOnly, Secure, SameSite=Lax cookies**; short access token plus refresh rotation. Never store tokens in localStorage.
- Authorization checked **on the server** for every route (role + ownership). A client may only read its own orders, wishlist and cart. Hiding a button is not security.
- Rate-limit auth and checkout routes; `helmet`, strict CORS allow-list, CSRF protection for cookie-based mutations.
- Google ID tokens verified server-side (audience = `GOOGLE_CLIENT_ID`); never trust data sent by the browser.
- The payment provider is simulated. **Never** collect, store or log real card numbers; the mock card form must be labelled "test payment" and discard the data after the call.
- Prices and totals are computed on the server from the database, never from the request body.
- File uploads: allow-list image types, check size and content type, random file names, no executable paths.
- Secrets only in env files that are git-ignored; commit `.env.example` only. Change the seeded admin password before any deployment.
- Analytics: no IP address stored, no fingerprinting, anonymous visitor id only.
