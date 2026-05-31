# AXION — Autonomous Logistics, Rendered in Real Time

A futuristic logistics platform landing experience with immersive real-time 3D
truck visualizations, wireframe transitions, cinematic scroll storytelling,
floating glassmorphism UI and a premium industrial sci‑fi aesthetic.

Built to feel like an Apple/Tesla‑grade product reveal: every section is a
camera move, every number counts up, every headline staggers into place.

## ✦ Experience

- **Real‑time 3D world (Three.js + WebGL)** — a procedurally‑built Class‑8
  autonomous hauler, an autonomous warehouse with roaming AGV lights, and a
  planetary network globe, all rendered live in the browser with PBR materials,
  soft shadows and `UnrealBloom` glow.
- **Wireframe transitions** — the truck morphs from glowing wireframe into a
  solid, sensor‑aware vehicle as you enter the Fleet section.
- **Cinematic scroll storytelling (GSAP + ScrollTrigger)** — a single scrubbed
  timeline flies the camera between hand‑authored section states (position,
  target, FOV, wireframe mix) for continuous, film‑like motion.
- **Ultra‑smooth scrolling (Lenis)** — inertial smooth scroll wired into
  ScrollTrigger so DOM and 3D share one buttery scroll position.
- **Floating OS chrome / glassmorphism UI** — a fixed HUD, live telemetry rail,
  section progress dots and frosted glass panels with corner brackets make the
  interface feel like a futuristic operating system.
- **Alive AI/data sections** — additive particle "data‑dust", glowing wireframe
  globe with travelling arc pulses, and a streaming decision feed.
- **Agency‑level typography** — oversized minimal layouts with per‑word
  staggered reveals, animated counters and magnetic buttons.
- **Tuned motion** — durations sit in the cinematic 0.6s–1.2s band with
  `expo`/`power3`/`elastic` easing curves. Respects `prefers-reduced-motion`.

## ✦ Tech

| Layer            | Tooling                                   |
| ---------------- | ----------------------------------------- |
| 3D / WebGL       | [three](https://threejs.org) + postprocessing (UnrealBloom) |
| Animation        | [gsap](https://gsap.com) + ScrollTrigger  |
| Smooth scroll    | [lenis](https://github.com/darkroomengineering/lenis) |
| Build            | [vite](https://vitejs.dev)                |

> The trucks, warehouse and network are generated procedurally in Three.js so
> the experience runs with **no external GLTF asset downloads**. The code is
> structured so Spline/Blender‑exported GLTF assets can be dropped into
> `public/assets/` and loaded in `src/three/truck.js` / `warehouse.js` to swap
> in higher‑fidelity meshes without touching the scroll/camera system.

## ✦ Getting started

```bash
npm install
npm run dev      # local dev server (http://localhost:5173)
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## ✦ Structure

```
index.html              # section markup + HUD / glass UI
src/
  main.js               # boot sequence + preloader
  styles.css            # sci‑fi design system (glass, grid, typography)
  three/
    world.js            # renderer, camera rig, lights, bloom, section states
    truck.js            # procedural autonomous hauler (solid + wireframe)
    warehouse.js        # racking grid, dock portals, roaming AGVs
    particles.js        # data‑dust field + network globe
  scroll/
    scroll.js           # Lenis + ScrollTrigger master timeline + nav sync
  ui/
    ui.js               # splits, reveals, counters, magnetic, form
```

## ✦ Section map

`Hero → Fleet → Network → Intelligence → Warehouse → Deploy`

Each maps to a camera state in `AxionWorld.STATES`; scrolling blends between
adjacent states with a smoothstep curve while DOM content reveals in sync.
