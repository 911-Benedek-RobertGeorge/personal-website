# Robot Scroll Choreography — Design

Date: 2026-07-05
Status: Approved in brainstorming session

## Goal

Evolve the existing one-page sales site (Benedek Systems) into an immersive, "robot-guided" experience: the existing 3D robot travels through the viewport as the visitor scrolls and reacts to each section — while the page stays conversion-focused, fast on mobile, and fully functional without WebGL. The build itself doubles as a skills showcase (engineer positioning).

## Decisions made (with the user)

1. **Direction:** robot-guide + scroll choreography. Not a full 3D world, not hero-only.
2. **Implementation:** hand-rolled waypoint choreography engine extending the existing scroll-scrub mechanism in `Model.tsx`. Only new dependency: `@react-three/drei` (version compatible with R3F 9 RC + React 19). No GSAP, no Theatre.js. Postprocessing (bloom) only if it stays cheap; default off.
3. **Content scope:** visual/3D layer + targeted content touch-ups (below). No copy rewrite.

## Architecture

Files touched: 3 existing + 1 new.

### `src/app/components/choreography.ts` (new)

- The storyboard as data. Waypoint shape (indicative):
  - `sectionId` — matches a `data-choreo` anchor in `LandingPage.tsx`
  - `robot`: viewport-normalized position (x, y on a fixed z-plane), `rotationY`, `scale`
  - `clipWindow`: `[t0, t1]` fractions of the GLB animation clip scrubbed within this section
  - `camera`: small drift/push-in offsets
- Section offsets are **measured from the DOM** on mount and on resize, producing a scroll timeline. Content edits (new cards, longer copy) re-calibrate automatically — nothing is hardcoded to pixel offsets.
- Pure function `resolvePose(scrollProgress, timeline) → Pose` with smoothstep interpolation between adjacent waypoints, clamped at both ends.
- Resilient to missing anchors: a waypoint whose section is absent is skipped.

### `src/app/components/Model.tsx` (extend)

- The existing RAF scroll loop additionally applies the resolved pose (position/rotation/scale) and scrubs the clip inside the active waypoint's `clipWindow` (replacing the current whole-page whole-clip scrub).

### `src/app/components/Scene.tsx` (extend)

- Canvas becomes a **full-viewport fixed overlay**, `pointer-events-none`, layered above background glows and below navbar/popups/expanded video.
- Camera rig applies per-waypoint drift; drei environment lighting; accent light color shifts per section (purple at philosophy, sea-green at booking).
- New lightweight particles layer (~200 `Points`, slow drift, teal/purple tints) for the "ocean depth" feel. Desktop only.

### `src/app/components/LandingPage.tsx` (touch)

- Sections get `data-choreo` anchors.
- The LinkedIn popup trigger and the robot "wave" waypoint share the same scroll threshold source (single source of truth), so the two moments are synchronized.
- Content touch-ups (see below).

## Storyboard (approved)

| # | Section | Robot position | Behavior |
|---|---------|----------------|----------|
| 1 | Hero + VSL | left, lower third | wake-up clip window, idle float |
| 2 | Credibility / LinkedIn | right, near LinkedIn card | "wave" beat synced with the 👋 popup |
| 3 | Pain points | center-left | agitated window, faces the red cards |
| 4 | Case studies | right | presenting beat toward metric badges |
| 5 | Services | left, near sticky title | calm hover |
| 6 | Philosophy / terminal | center, near terminal card | "processing" window |
| 7 | Booking | center-right, beside form | inviting beat, camera push-in |
| — | Footer | corner | shrink/settle to rest pose |

**Accepted constraint:** the robot is a WebGL layer rendered above the DOM; it cannot pass behind glass cards. The path is routed through layout gutters; in dense sections the robot shrinks toward the margins. It must never cover text or interactive elements.

## Assets

- Compress `public/robot_playground.glb` (currently 8.7MB) with `gltf-transform` (Draco + texture optimization), target ≤2MB. Verify visual parity; if quality degrades, keep the original.

## Mobile & accessibility

- `< 768px`: robot docked bottom-left (current behavior), whole-clip scroll scrub exactly as today — no travel, no per-section clip windows, no particles.
- `prefers-reduced-motion`: static pose, no travel, no idle float.
- No WebGL / GLB load failure: page renders and converts normally without the robot (existing graceful path).

## Performance

- Keep `dpr` capped at `[1, 1.5]`; single robot + light particles only.
- RAF loop early-exits pose application when scroll is unchanged and the pose has settled.
- No postprocessing unless measurably cheap (default: off).

## Content touch-ups

- Case studies: eyebrow label "Date din producție"; one sea-green (`#2AAF7F`) metric badge per card: "+40% eficiență", "0 erori umane", "3.5x ROI".
- Hero: bold sea-green pre-CTA line above the CTA: "Nu lăsa lead-uri să scape."
- Everything else (navbar labels, offers, form, footer) stays as currently tuned by the user.

## Verification

- `scripts/choreography.check.mjs` — plain `node` assert script for `resolvePose` (boundary clamping, midpoint interpolation, missing-anchor skip). No test framework.
- `npm run lint` and `npm run build` pass clean.
- Manual visual pass at multiple scroll positions, desktop + mobile viewport + reduced-motion.
- All work on the current worktree branch; the live Vercel deployment is untouched until the user merges.

## Out of scope

- Full immersive 3D world / camera-through-world, GSAP, Theatre.js.
- New sections, new offers, VSL changes, backend/API changes, copy rewrite.
- External connectors (Higgsfield etc.) — not needed; everything is local.
