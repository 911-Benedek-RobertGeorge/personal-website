# Immersive Robot Stage — Design (v2 redesign)

Date: 2026-07-06
Status: Concept approved in brainstorming session
Branch: `claude/immersive-stage` (v1 choreography preserved separately on `claude/optimistic-rhodes-a07654`)

## Goal

Replace the v1 "robot darts across the page" choreography — rejected by the user as fast and senseless — with a robot-centric **pinned stage**: the robot is the fixed centerpiece, and content panels enter and exit AROUND him, synchronized with beats of his animation. The full page is rethought as an immersive 3D experience (per the user's reference prompt) that stays conversion-first, with the story arc: **AI helper → implementations → results I deliver**.

## User decisions

1. Robot = star of the stage, then a discreet corner presence for the rest of the page. No traveling.
2. VSL gets its own cinematic section immediately after the stage.
3. Approved concept: pinned stage with 5 beats + 3-act page structure.
4. The floating particle dots stay and remain site-wide (user explicitly likes them).
5. The user delegated page-level content framing to us: results-focused, reusing the proven Romanian copy where it fits.

## Page architecture — 3 acts

### Act 1 — The pinned stage (`~500vh` scroll, sticky `100vh` viewport)

A `<section>` of height ~500vh with a `position: sticky; top: 0; height: 100vh` inner stage. Stage progress `p ∈ [0,1]` = scroll consumed within the section. The robot sits center-viewport in the existing full-viewport canvas; DOM glass panels are absolutely positioned around him inside the sticky element.

**The 5 beats** (each beat: a `clipWindow` of the 25s GLB animation scrubbed across its range, an accent light color, and a set of panels with enter/exit windows):

| # | Beat | `p` range | Around the robot | Accent |
|---|------|-----------|------------------|--------|
| 1 | Trezirea | 0.00–0.18 | H1 "Motorul de Clienți Noi" + sub "Sisteme AI care lucrează non-stop pentru afacerea ta" + CTA "Activează Sistemul", top-center; scroll cue bottom | teal `#1E94A5` |
| 2 | AI Helper — ce implementez | 0.18–0.40 | 4 chips orbit in (left/right): Asistent AI 24/7 · CRM + automatizări · Reactivare bază de date · Web AI-driven | teal |
| 3 | Haosul de azi | 0.40–0.60 | 3 pain panels (reused copy): lead-uri care scapă · follow-up manual, uitat · zero vizibilitate în cifre | purple `#76007D` |
| 4 | Rezultatele | 0.60–0.82 | 4 **animated counters**: 3.5x ROI · 0 erori umane · +40% eficiență · 24/7 | sea green `#2AAF7F` |
| 5 | Activarea | 0.82–1.00 | Big CTA "Activează Sistemul" + bold "Nu lăsa lead-uri să scape."; robot settles into inviting pose | sea green |

- Panels animate with CSS transitions only (opacity + translate + slight scale), class-toggled from `p`. Enter/exit windows overlap beats slightly so transitions feel continuous, part of the robot's motion.
- Robot micro-motion within the stage: slow breathing scale (±2%), idle bob, and **mouse-follow** — the robot group lerps a subtle rotation toward the cursor (max ~0.15 rad, eased; desktop only).
- Beat transitions are SLOW by design: each beat owns ≥18% of a 500vh scroll — roughly a full viewport of scrolling per beat. This is the direct fix for v1's "fast and senseless" failure.
- At `p = 1` the stage unpins; the robot transitions once to a small, low-opacity corner dock (bottom-right) and stays there for the rest of the page.

### Act 2 — VSL + credibility

- **VSL section**: the existing YouTube embed in a large centered glass frame with teal/purple glow, scroll-reveal (opacity + scale 0.94→1). Expand-on-play behavior kept.
- **Credibility strip**: the existing 3-block bar (Backend Engineer / Itheum+Tokeny / LinkedIn card) with the 👋 popup, trigger unchanged (section-based).

### Act 3 — Conversion tail (all sections reveal-on-scroll, particles behind)

- **Dovezi din producție**: the 3 scenario cards re-led by their metric — the badge becomes a mini-counter that counts up on reveal.
- **Ce implementez**: the 4 service cards (Premium kept) with **3D tilt on hover** (CSS transform from pointer position, max ~6°, no library).
- **Inginerie, nu gălăgie**: condensed — the terminal card + the 3 guarantee bullets.
- **Booking**: existing form (Resend) + Calendly untouched.
- **Footer**: unchanged.

## Components & files

- **`src/app/components/stage.ts` (new)** — pure data + math, zero imports (same testability pattern as v1's `choreography.ts`): `BEATS` array, `resolveStage(p)` → `{ clipT, accentRGB, robotPose micro-offsets, panelStates }`, plus the shared `smoothstep`/`hexToRgb` helpers moved here. **`choreography.ts` is deleted** (its waypoint model retires with v1); `scripts/choreography.check.mjs` becomes `scripts/stage.check.mjs`, and the npm script renames to `check:stage`.
- **`src/app/components/StagePanels.tsx` (new)** — client component rendering the beat panels inside the sticky stage; computes `p` from the stage element rect on scroll (own rAF-throttled listener); pure DOM, no R3F.
- **`src/app/components/Counter.tsx` (new)** — counts from 0 to target on first visibility (rAF, ~1s ease-out); renders the final value immediately under reduced-motion. Used in beat 4 and Act 3 badges.
- **`src/app/components/useReveal.ts` (new)** — tiny IntersectionObserver hook adding a `revealed` class; CSS handles the transition. Used across Act 2/3.
- **`Scene.tsx` (modify)** — `ChoreoRig` becomes `StageRig`: reads the same stage `p` (measures the stage element), drives `clipT` + accent light + mouse-follow + the one-time corner dock after the stage. Docked/mobile/reduced logic and `CanvasErrorBoundary` kept.
- **`LandingPage.tsx` (restructure)** — stage markup (Act 1), VSL section, reordered tail; `data-choreo` attributes retire except the credibility popup ref.
- **`scripts/` check** — extend the existing node check to cover `resolveStage` (beat lookup, panel windows, clamping, monotonic beat ranges).

## Mobile, accessibility, failure modes

- **Mobile (<768px)**: the pinned stage is KEPT (it is the product demo) but compact: robot smaller, upper-center; panels appear one per beat as a bottom-anchored card; stage height 400vh; no particles (as today). After the stage, the robot docks to the existing mobile pose (small, bottom-left); on desktop the post-stage dock is bottom-right.
- **`prefers-reduced-motion`**: no pinning — beats render as normal stacked static sections, robot static pose, counters show final values, no reveals.
- **No WebGL / GLB failure**: the existing `CanvasErrorBoundary` + graceful loader keep every panel, counter, and form fully functional — the stage simply shows panels without the robot.
- **SSR**: stage panels render server-side in their final-beat-agnostic base state; all measurement in effects (Scene already `ssr: false`).

## Performance

- Same canvas budget as v1: one robot + 200 points, `dpr [1, 1.5]`, pose work gated on scroll change. Panel/reveal animations are CSS-only; counters are short-lived rAF. No new dependencies.

## Verification

- Node check for `resolveStage` invariants in `scripts/stage.check.mjs` (npm script `check:stage`): beat ranges contiguous and monotonic 0→1, clip windows sane, panel windows within their beat ±overlap, clamping at both ends.
- `npm run lint` (0 errors) + `npm run build` clean.
- Visual pass desktop + mobile: beat pacing feels slow/intentional, panels never cover the robot's face zone, CTA clickable in beats 1/5, VSL plays, popup fires, form submits, counters trigger once.
- Reduced-motion pass by code review + DevTools emulation attempt.

## Out of scope

- Copy rewrite beyond the beat texts listed; new offers/sections; GSAP/Theatre/drei; touching the v1 branch; backend changes.
