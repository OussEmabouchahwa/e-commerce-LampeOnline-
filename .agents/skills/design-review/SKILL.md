---
name: design-review
description: Review the running interface with screenshots at several widths, compare it with the design system and the forbidden list, then fix what looks wrong. Use after any visual change and before finishing a phase.
---
# Design review
1. Start the app and open each changed screen in the browser. Take screenshots at **375, 768 and 1280 px**, in light and dark.
2. Check, in this order: hierarchy (what do I see first?), spacing rhythm on the 4-px grid, alignment, type scale, contrast, tokens only, states (loading/empty/error/long text), focus ring, touch targets, reduced-motion behavior.
3. Compare with `docs/DESIGN_SYSTEM.md` and its "Forbidden" list. Ask: would this screen look the same for any other shop? If yes, find the lamp-specific idea that is missing.
4. Apply "remove one accessory": delete one decoration or effect that does not help the user.
5. For 3D/animation screens, record FPS and confirm the fallback works with WebGL disabled.
6. Fix issues, re-take screenshots, and list what you changed (3–7 bullets). Do not report "looks good" without having looked.
