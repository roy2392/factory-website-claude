# AXION — Autonomous Logistics, Rendered in Real Time

A futuristic logistics platform landing experience with immersive real-time 3D
truck visualizations, wireframe transitions, cinematic scroll storytelling,
floating glassmorphism UI and a premium industrial sci‑fi aesthetic.

Built to feel like an Apple/Tesla‑grade product reveal: every section is a
camera move, every number counts up, every headline staggers into place.

## ✦ Experience

- **Real‑time 3D world (Three.js + WebGL)** — a real **GLB hero vehicle**
  streamed in live, an autonomous warehouse with roaming AGV lights, and a
  planetary network globe, all rendered with PBR materials, image‑based
  lighting (`RoomEnvironment`), soft shadows and `UnrealBloom` glow. A
  procedural Class‑8 hauler renders instantly and is swapped for the GLB once
  it decodes (and stays as a graceful fallback if the model fails to load).
- **Wireframe transitions** — the vehicle morphs from glowing edge‑wireframe
  into its solid, sensor‑aware form as you enter the Fleet section. The morph
  works on any loaded GLB, not just the procedural mesh.
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

> The hero vehicle is a real GLB (`public/assets/vehicle.glb`); the warehouse
> and network are generated procedurally. The vehicle loader
> (`src/three/vehicle.js`) normalises any GLB — converts Z‑up → Y‑up, recentres,
> grounds and rescales it, builds the edge‑wireframe overlay and collects its
> materials — so you can swap in a different model just by replacing the file.

### Asset pipeline

The supplied Sketchfab model used `KHR_materials_pbrSpecularGlossiness`, which
modern three.js `GLTFLoader` no longer supports. It's converted offline to
metallic‑roughness (and pruned/dedup'd) with [glTF‑Transform](https://gltf-transform.dev):

```bash
node tools/convert-car.mjs   # tools/_src_car.glb → public/assets/vehicle.glb
```

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
    world.js            # renderer, camera rig, lights, bloom, IBL, section states
    vehicle.js          # GLB hero-vehicle loader (normalise + wireframe overlay)
    truck.js            # procedural autonomous hauler (solid + wireframe fallback)
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
