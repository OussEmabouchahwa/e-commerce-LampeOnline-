---
trigger: always_on
description: Design guardrails so the interface looks designed by a person, not generated
---
# Design guardrails
- Follow `docs/DESIGN_SYSTEM.md` exactly. Components consume tokens; **no hex colors or magic numbers in components**.
- Spend boldness in one place: the light. Everything else stays quiet. Before finishing a screen, remove one decoration.
- Every screen has designed states: loading (skeleton), empty, error, success, and long text/overflow.
- Check every screen at 375, 768 and 1280 px, light and dark, keyboard only, and with reduced motion.
- 3D and animation must respect the performance budget and `prefers-reduced-motion`; every 3D feature has a non-3D fallback.
- Do not use the patterns listed under "Forbidden" in the design system.
- Visual work is not done until you have looked at screenshots and fixed what you saw (use the `design-review` skill).
