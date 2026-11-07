---
name: auth-and-payments
description: Implement sign-up, sign-in, Google sign-in, sessions, roles, the visitor-to-client purchase gate, and the simulated payment provider. Use for any login, registration, role or checkout-payment task.
---
# Auth and payments
## Auth
- Email form: name, email, password only. Inline validation, show/hide password, clear errors, no CAPTCHA unless abuse is observed.
- Google: use Google Identity Services on the web, send the ID token to `POST /auth/google`, verify with `google-auth-library`, create or link by `googleId`/email, copy name and avatar. Without `GOOGLE_CLIENT_ID` in dev, render a labelled "Dev mock Google account" button that calls the same endpoint in mock mode (disabled in production).
- Sessions: httpOnly cookies, refresh rotation, logout clears both. `GET /auth/me` boots the SPA.
- Roles `CLIENT` and `ADMIN`. Route guards on the web are for UX only; the API enforces roles.
- **Purchase gate**: when a visitor starts checkout, open the auth modal, remember `returnTo` and the guest cart, and merge the guest cart into the server cart after sign-in.
- Blocked users: 403 with a clear message at sign-in.
## Payments
- Define `PaymentProvider { createPayment(order): Promise<PaymentResult>; confirm(ref): Promise<PaymentResult> }`. Implement `MockPaymentProvider` and `CashOnDeliveryProvider`; choose by `PAYMENT_PROVIDER`.
- Mock card numbers: 4242… success, 4000 0000 0000 0002 decline, 4000 0000 0000 3220 extra 3-second verification. Add a visible "Test payment" label.
- Never store card data. The provider returns a reference; store only that.
- Payment failure keeps the cart and shows how to retry. Success shows an order confirmation page with the order number.
- Adding a real gateway later must require only a new provider class.
## Tests
Unit tests for the provider and transitions; API tests for login, Google (mocked verifier), blocked user, ownership checks; E2E for visitor → sign-up → purchase.
