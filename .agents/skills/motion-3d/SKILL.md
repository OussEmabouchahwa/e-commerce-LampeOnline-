---
name: motion-3d
description: Create the 3D lamp scenes, light effects, tilt cards and micro-interactions of LampeOnline with React Three Fiber, drei and Framer Motion, within a strict performance budget. Use for any 3D, animation or "wow" interaction task.
---
# Motion and 3D
## 3D scenes
- Procedural lamps built from parametric geometry (lathe for shades, cylinders for stems and bases) driven by the product `model3d` JSON; no large model files.
- Hero: one lamp, soft cursor-follow rotation (max 8°), click toggles light. Product page: `OrbitControls` (no zoom on scroll, drag only), light switch, `ColorTempSlider` mapping Kelvin to RGB for the point light.
- Lights: one point light inside the shade plus a low ambient light; emissive material on the bulb; no real-time shadows on mobile.
- Lazy-load the canvas; `dpr={[1,2]}`; `frameloop="demand"` when idle; pause when not visible (IntersectionObserver) or tab hidden.
- Fallback: static image when WebGL is missing, device is low-end (`navigator.hardwareConcurrency <= 4` and mobile) or `prefers-reduced-motion`.
## UI motion
- Card tilt (≤ 6°, pointer devices only), fly-to-cart (300–450 ms), heart burst (250 ms), shared-element page transition (`layoutId`), count-up and chart draw-in once per admin visit.
- Animate `transform` and `opacity` only. No layout-thrashing animations.
## Budget and proof
First load JS under 250 kB gzip excluding the lazy 3D chunk; 3D chunk under 400 kB gzip; steady 60 fps on a mid-range laptop. Measure with Lighthouse and the browser performance panel, and report the numbers in your summary.
