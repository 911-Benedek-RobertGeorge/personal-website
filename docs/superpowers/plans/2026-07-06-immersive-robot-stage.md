# Immersive Robot Stage (v2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A pinned full-viewport stage where the robot sits center and content panels orbit around him in 5 scroll-driven beats, followed by a cinematic VSL section and a conversion tail with counters, reveals, and 3D tilt cards.

**Architecture:** A pure-math beat module (`stage.ts`) maps stage progress `p ∈ [0,1]` to clip time, accent color, and panel visibility. Two independent consumers read the same `[data-stage]` element: `StagePanels` (DOM, sticky stage + glass panels, rAF-driven inline styles) and `StageRig` in `Scene.tsx` (robot clip scrub, mouse-follow, one-time corner dock after the stage). Act 2/3 use small primitives: `Counter`, `useReveal`, `TiltCard`. Spec: `docs/superpowers/specs/2026-07-06-immersive-robot-stage-design.md`.

**Tech Stack:** Next.js 16 (App Router), React 19, @react-three/fiber 9.0.0-rc.1, three 0.163, Tailwind 3.4, lucide-react. Node 22.17.1.

## Global Constraints

- Branch: `claude/immersive-stage`. Commit per task; NEVER push. The v1 branch `claude/optimistic-rhodes-a07654` must not be touched.
- NO new dependencies, no version bumps.
- Brand colors verbatim: teal `#1E94A5` (light `#39B5C4`), purple `#76007D`, sea green `#2AAF7F`, navy `#000022`.
- Romanian copy verbatim with diacritics (beat table in Task 3 is normative).
- The robot canvas overlay stays `fixed inset-0 z-[999] pointer-events-none`. `dpr` stays `[1, 1.5]`. `CanvasErrorBoundary` and MeshoptDecoder wiring must survive every edit.
- Stage heights: `h-[400vh] md:h-[500vh]`. Sticky child: `sticky top-0 h-screen overflow-hidden`.
- Gates before every task's commit: `npm run lint` (0 errors; 6 pre-existing `<img>`/unused-var warnings acceptable), `npm run build` passes, and the applicable check script passes. Environment: if a network command fails inside the sandboxed shell, retry with `dangerouslyDisableSandbox: true` (user authorized). ExperimentalWarning from `--experimental-strip-types` on stderr is normal.
- The LinkedIn 👋 popup (credibility section, `credSectionRef`) must keep working unchanged.

---

### Task 1: Stage math core (`stage.ts`) + runnable check

**Files:**
- Create: `src/app/components/stage.ts`
- Create: `scripts/stage.check.mjs`
- Modify: `package.json` (add `check:stage` script; leave `check:choreo` alone — Task 4 removes it)

**Interfaces:**
- Consumes: nothing (pure module, zero imports).
- Produces (used by Tasks 3 and 4):
  - `type Beat = { id: string; range: [number, number]; clip: [number, number]; accent: string }`
  - `type PanelSpec = { id: string; enterAt: number; exitAt: number }`
  - `const BEATS: Beat[]` (5 beats: wake, helper, chaos, results, activate)
  - `const PANELS: PanelSpec[]` (17 desktop + 5 mobile `m-*` panels)
  - `const PANEL_FADE = 0.035`
  - `function smoothstep(t: number): number`
  - `function hexToRgb(hex: string): [number, number, number]`
  - `function panelT(spec: PanelSpec, p: number): number` — trapezoid 0..1
  - `type StageState = { clipT: number; accentR: number; accentG: number; accentB: number; beatIndex: number }`
  - `function resolveStage(p: number): StageState`

- [ ] **Step 1: Write the failing check script**

Create `scripts/stage.check.mjs`:

```js
// Runnable check for the pure stage math. Run: npm run check:stage
import assert from "node:assert/strict";
import {
  BEATS,
  PANELS,
  PANEL_FADE,
  panelT,
  resolveStage,
  smoothstep,
  hexToRgb,
} from "../src/app/components/stage.ts";

// Beats: contiguous ranges covering exactly 0 -> 1.
assert.equal(BEATS[0].range[0], 0, "first beat starts at 0");
assert.equal(BEATS[BEATS.length - 1].range[1], 1, "last beat ends at 1");
for (let i = 1; i < BEATS.length; i++) {
  assert.equal(BEATS[i].range[0], BEATS[i - 1].range[1], `beat ${BEATS[i].id} contiguous`);
}

// Clip windows: contiguous, covering exactly 0 -> 1.
assert.equal(BEATS[0].clip[0], 0, "clip starts at 0");
assert.equal(BEATS[BEATS.length - 1].clip[1], 1, "clip ends at 1");
for (let i = 1; i < BEATS.length; i++) {
  assert.equal(BEATS[i].clip[0], BEATS[i - 1].clip[1], `clip ${BEATS[i].id} contiguous`);
}

// Panels: unique ids, sane windows.
const ids = new Set(PANELS.map((s) => s.id));
assert.equal(ids.size, PANELS.length, "unique panel ids");
for (const s of PANELS) {
  assert.ok(s.enterAt < s.exitAt, `panel ${s.id} window ordered`);
  assert.ok(s.enterAt >= 0 && s.exitAt <= 1.05, `panel ${s.id} window in range`);
}

// panelT trapezoid: 0 before enter, 1 mid-window, 0 after exit.
const w = PANELS.find((s) => s.id === "helper-chip-1");
assert.equal(panelT(w, w.enterAt - 0.01), 0, "hidden before enter");
const mid = (w.enterAt + w.exitAt) / 2;
assert.equal(panelT(w, mid), 1, "fully visible mid-window");
assert.equal(panelT(w, w.exitAt + 0.01), 0, "hidden after exit");
assert.ok(panelT(w, w.enterAt + PANEL_FADE / 2) > 0 && panelT(w, w.enterAt + PANEL_FADE / 2) < 1, "ramps during fade");

// resolveStage: clamping and endpoints.
assert.deepEqual(resolveStage(-1), resolveStage(0), "clamped below");
assert.deepEqual(resolveStage(2), resolveStage(1), "clamped above");
assert.equal(resolveStage(0).clipT, 0, "clip starts at 0");
assert.equal(resolveStage(1).clipT, 1, "clip ends at 1");
assert.equal(resolveStage(0).beatIndex, 0);
assert.equal(resolveStage(1).beatIndex, BEATS.length - 1);

// clipT is continuous across every beat boundary.
for (let i = 1; i < BEATS.length; i++) {
  const b = BEATS[i].range[0];
  const before = resolveStage(b - 1e-6).clipT;
  const after = resolveStage(b + 1e-6).clipT;
  assert.ok(Math.abs(before - after) < 1e-3, `clipT continuous at ${BEATS[i].id}`);
}

// Accent equals the beat color at beat centers.
for (const b of BEATS) {
  const center = (b.range[0] + b.range[1]) / 2;
  const st = resolveStage(center);
  const [r, g, bl] = hexToRgb(b.accent);
  assert.ok(Math.abs(st.accentR - r) < 1e-9 && Math.abs(st.accentG - g) < 1e-9 && Math.abs(st.accentB - bl) < 1e-9, `accent at ${b.id}`);
}

// smoothstep sanity.
assert.equal(smoothstep(0), 0);
assert.equal(smoothstep(1), 1);
assert.equal(smoothstep(0.5), 0.5);
assert.equal(smoothstep(-3), 0);
assert.equal(smoothstep(3), 1);

console.log("stage check: OK");
```

- [ ] **Step 2: Add the npm script and verify the check fails**

In `package.json` scripts, after the `check:choreo` line, add:

```json
    "check:stage": "node --experimental-strip-types scripts/stage.check.mjs",
```

Run: `npm run check:stage`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` (stage.ts doesn't exist yet).

- [ ] **Step 3: Implement the stage module**

Create `src/app/components/stage.ts`:

```ts
// Pure stage math. Zero imports — runnable by plain node for the check script.

export type Beat = {
  id: string
  /** Stage progress window [p0, p1]. Contiguous, 0 -> 1. */
  range: [number, number]
  /** GLB clip window scrubbed across this beat. Contiguous, 0 -> 1. */
  clip: [number, number]
  /** Accent light hex while the beat is active. */
  accent: string
}

export type PanelSpec = {
  id: string
  /** Stage-progress window in which the panel is on screen. */
  enterAt: number
  exitAt: number
}

// The approved 5-beat storyboard. Ranges/windows tuned in Task 6.
export const BEATS: Beat[] = [
  { id: "wake",     range: [0.00, 0.18], clip: [0.00, 0.16], accent: "#1E94A5" },
  { id: "helper",   range: [0.18, 0.40], clip: [0.16, 0.42], accent: "#1E94A5" },
  { id: "chaos",    range: [0.40, 0.60], clip: [0.42, 0.62], accent: "#76007D" },
  { id: "results",  range: [0.60, 0.82], clip: [0.62, 0.86], accent: "#2AAF7F" },
  { id: "activate", range: [0.82, 1.00], clip: [0.86, 1.00], accent: "#2AAF7F" },
]

// Desktop panels + mobile per-beat cards (m-*). exitAt 1.05 = stays until unpin.
export const PANELS: PanelSpec[] = [
  { id: "wake-headline",  enterAt: 0.00, exitAt: 0.17 },
  { id: "wake-cue",       enterAt: 0.00, exitAt: 0.15 },
  { id: "helper-title",   enterAt: 0.18, exitAt: 0.39 },
  { id: "helper-chip-1",  enterAt: 0.20, exitAt: 0.39 },
  { id: "helper-chip-2",  enterAt: 0.22, exitAt: 0.39 },
  { id: "helper-chip-3",  enterAt: 0.24, exitAt: 0.39 },
  { id: "helper-chip-4",  enterAt: 0.26, exitAt: 0.39 },
  { id: "chaos-title",    enterAt: 0.40, exitAt: 0.59 },
  { id: "chaos-pain-1",   enterAt: 0.42, exitAt: 0.59 },
  { id: "chaos-pain-2",   enterAt: 0.44, exitAt: 0.59 },
  { id: "chaos-pain-3",   enterAt: 0.46, exitAt: 0.59 },
  { id: "results-title",  enterAt: 0.60, exitAt: 0.81 },
  { id: "results-c1",     enterAt: 0.62, exitAt: 0.81 },
  { id: "results-c2",     enterAt: 0.63, exitAt: 0.81 },
  { id: "results-c3",     enterAt: 0.64, exitAt: 0.81 },
  { id: "results-c4",     enterAt: 0.65, exitAt: 0.81 },
  { id: "activate-cta",   enterAt: 0.82, exitAt: 1.05 },
  { id: "m-wake",     enterAt: 0.00, exitAt: 0.17 },
  { id: "m-helper",   enterAt: 0.18, exitAt: 0.39 },
  { id: "m-chaos",    enterAt: 0.40, exitAt: 0.59 },
  { id: "m-results",  enterAt: 0.60, exitAt: 0.81 },
  { id: "m-activate", enterAt: 0.82, exitAt: 1.05 },
]

/** Fade width, in stage-progress units, at each end of a panel window. */
export const PANEL_FADE = 0.035
/** Width of the accent-color crossfade approaching a beat boundary. */
export const ACCENT_BLEND = 0.02

export function smoothstep(t: number): number {
  const c = Math.min(Math.max(t, 0), 1)
  return c * c * (3 - 2 * c)
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/** Trapezoid visibility: 0 before enter, ramps over PANEL_FADE, 1 mid-window, back to 0 by exit. */
export function panelT(spec: PanelSpec, p: number): number {
  const rise = smoothstep((p - spec.enterAt) / PANEL_FADE)
  const fall = smoothstep((spec.exitAt - p) / PANEL_FADE)
  return Math.min(rise, fall)
}

export type StageState = {
  clipT: number
  accentR: number
  accentG: number
  accentB: number
  beatIndex: number
}

function beatAt(p: number): number {
  for (let i = BEATS.length - 1; i >= 0; i--) {
    if (p >= BEATS[i].range[0]) return i
  }
  return 0
}

export function resolveStage(p: number): StageState {
  const c = Math.min(Math.max(p, 0), 1)
  const i = beatAt(c)
  const b = BEATS[i]
  const span = b.range[1] - b.range[0]
  const local = span > 0 ? (c - b.range[0]) / span : 1
  // smoothstep per beat = the clip eases in and out of every beat (slow, intentional).
  const clipT = b.clip[0] + (b.clip[1] - b.clip[0]) * smoothstep(local)

  let [r, g, bl] = hexToRgb(b.accent)
  const next = BEATS[i + 1]
  if (next) {
    const d = b.range[1] - c
    if (d < ACCENT_BLEND) {
      const k = (1 - d / ACCENT_BLEND) * 0.5
      const [nr, ng, nb] = hexToRgb(next.accent)
      r += (nr - r) * k
      g += (ng - g) * k
      bl += (nb - bl) * k
    }
  }
  return { clipT, accentR: r, accentG: g, accentB: bl, beatIndex: i }
}
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `npm run check:stage`
Expected: `stage check: OK`, exit 0.

- [ ] **Step 5: Verify the app still builds (module is dead code until Task 3)**

Run: `npm run lint && npm run build`
Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/stage.ts scripts/stage.check.mjs package.json
git commit -m "feat: pure stage math — 5 beats, panel windows, clip/accent resolver with runnable check"
```

---

### Task 2: Primitives — `Counter`, `useReveal`, `TiltCard`

**Files:**
- Create: `src/app/components/Counter.tsx`
- Create: `src/app/components/useReveal.ts`
- Create: `src/app/components/TiltCard.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces (used by Tasks 3 and 5):
  - `Counter` (default export): props `{ to: number; decimals?: number; prefix?: string; suffix?: string; active: boolean; duration?: number; className?: string }` — counts 0→`to` on first `active=true`; renders final value immediately under reduced-motion.
  - `useReveal` (named export): `function useReveal<T extends HTMLElement>(threshold?: number): readonly [React.RefObject<T | null>, boolean]` — IntersectionObserver, fires once; returns `revealed=true` immediately under reduced-motion.
  - `TiltCard` (default export): props `{ children: React.ReactNode; className?: string }` — pointer-driven 3D tilt, max ~6°, hover-capable devices only.

- [ ] **Step 1: Create Counter.tsx**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  active: boolean;
  duration?: number;
  className?: string;
};

// Counts 0 -> to with an ease-out once `active` first becomes true.
export default function Counter({ to, decimals = 0, prefix = '', suffix = '', active, duration = 1200, className }: Props) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    if (to === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(to);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(to * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, to, duration]);

  return (
    <span className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
```

- [ ] **Step 2: Create useReveal.ts**

```ts
'use client';

import { useEffect, useRef, useState } from 'react';

// Reveal-on-scroll: `revealed` flips true once when the element enters the viewport.
export function useReveal<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, revealed] as const;
}
```

Usage convention (Tasks 3/5): wrapper gets `className={`transition-all duration-700 ease-out ${revealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-[0.97]'}`}`. Known tradeoff (accepted): content is hidden until hydration for JS-off visitors — the site already requires JS (three.js, forms).

- [ ] **Step 3: Create TiltCard.tsx**

```tsx
'use client';

import { useRef } from 'react';

// Pointer-driven 3D tilt (max ~6deg). Hover-capable devices only; resets on leave.
export default function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !window.matchMedia('(hover: hover)').matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`transition-transform duration-200 will-change-transform ${className ?? ''}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run lint && npm run build`
Expected: both pass (components are unused yet — that's fine for one task).

- [ ] **Step 5: Commit**

```bash
git add src/app/components/Counter.tsx src/app/components/useReveal.ts src/app/components/TiltCard.tsx
git commit -m "feat: Counter, useReveal, TiltCard primitives"
```

---

### Task 3: `StagePanels` + LandingPage Act-1 restructure (stage in, hero+pains out, VSL relocated)

**Files:**
- Create: `src/app/components/StagePanels.tsx`
- Modify: `src/app/components/LandingPage.tsx`

**Interfaces:**
- Consumes: from Task 1 — `BEATS`, `PANELS`, `panelT` from `./stage`. From Task 2 — `Counter`, `useReveal`.
- Produces: `StagePanels` (default export): props `{ onPrimaryCta: () => void; onSecondaryCta: () => void }`. Renders the `<section data-stage>` (400vh mobile / 500vh desktop) with the sticky stage and ALL panels. Task 4's rig reads the same `[data-stage]` element.

**Known intermediate state (accepted):** after this task the OLD rig in Scene.tsx finds no `data-choreo` anchors, so its timeline is empty and the robot sits static at screen center. Site fully functional; Task 4 syncs the robot.

**Normative beat copy (verbatim, Romanian):**

| Panel | Content |
|---|---|
| wake-headline | badge `Sistem de automatizare AI`; H1 `Motorul de Clienți Noi`; sub `Sisteme AI care lucrează non-stop pentru afacerea ta`; CTA button `Activează Sistemul` |
| wake-cue | `derulează` + ↓ |
| helper-title | `Ce implementez` |
| helper chips | `Asistent AI 24/7` · `CRM + automatizări` · `Reactivare bază de date` · `Web AI-driven` |
| chaos-title | `Haosul de azi` |
| chaos pains | `Lead-uri care scapă` / `Clienți care întreabă seara și cumpără de la altcineva dimineața.` · `Follow-up manual, uitat` / `Mesaje trimise doar când îți aduci aminte.` · `Zero vizibilitate în cifre` / `Excel-uri pe care nu le mai înțelege nimeni.` |
| results-title | `Rezultate din producție` |
| results counters | `3.5x` / `ROI` · `0` / `erori umane` · `+40%` / `eficiență` · `24/7` / `mereu activ` |
| activate-cta | `Nu lăsa lead-uri să scape.` + CTA `Activează Sistemul` + secondary `sau trimite o cerere` |

- [ ] **Step 1: Create StagePanels.tsx**

```tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bot, Calendar, Database, Globe, Workflow, X } from 'lucide-react';
import Counter from './Counter';
import { BEATS, PANELS, panelT, type PanelSpec } from './stage';

type Props = {
  onPrimaryCta: () => void;
  onSecondaryCta: () => void;
};

const glass = 'rounded-xl bg-[#000022]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)]';
const chip = `${glass} px-4 py-2.5 text-sm font-semibold text-white flex items-center gap-2`;
const painCard = `${glass} border-red-500/20 px-4 py-3`;
const counterCard = `${glass} border-[#2AAF7F]/25 px-6 py-4 text-center`;

// Desktop outer-wrapper position classes per panel id (mobile m-* handled separately).
const POS: Record<string, string> = {
  'wake-headline': 'left-1/2 -translate-x-1/2 top-[10vh] w-[min(92vw,760px)] text-center',
  'wake-cue': 'left-1/2 -translate-x-1/2 bottom-[5vh]',
  'helper-title': 'left-1/2 -translate-x-1/2 top-[9vh] text-center',
  'helper-chip-1': 'left-[7vw] top-[27vh]',
  'helper-chip-2': 'right-[7vw] top-[31vh]',
  'helper-chip-3': 'left-[9vw] bottom-[28vh]',
  'helper-chip-4': 'right-[9vw] bottom-[24vh]',
  'chaos-title': 'left-1/2 -translate-x-1/2 top-[9vh] text-center',
  'chaos-pain-1': 'left-[6vw] top-[27vh] w-[min(30vw,320px)]',
  'chaos-pain-2': 'right-[6vw] top-[31vh] w-[min(30vw,320px)]',
  'chaos-pain-3': 'left-[8vw] bottom-[24vh] w-[min(30vw,320px)]',
  'results-title': 'left-1/2 -translate-x-1/2 top-[9vh] text-center',
  'results-c1': 'left-[9vw] top-[28vh]',
  'results-c2': 'right-[9vw] top-[28vh]',
  'results-c3': 'left-[11vw] bottom-[26vh]',
  'results-c4': 'right-[11vw] bottom-[26vh]',
  'activate-cta': 'left-1/2 -translate-x-1/2 bottom-[12vh] w-[min(92vw,560px)] text-center',
};

function CtaButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 px-7 h-14 rounded-xl border-2 border-[#39B5C4] bg-[#000022]/50 text-white font-semibold hover:scale-105 hover:border-[#2AAF7F] hover:text-[#2AAF7F] transition-all duration-300"
    >
      <Calendar size={18} />
      {children}
    </button>
  );
}

export default function StagePanels({ onPrimaryCta, onSecondaryCta }: Props) {
  const stageRef = useRef<HTMLElement | null>(null);
  const innerRefs = useRef(new Map<string, HTMLDivElement>());
  const countersOnRef = useRef(false);
  const [countersOn, setCountersOn] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const tick = () => {
      const el = stageRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const span = rect.height - window.innerHeight;
        const p = span > 0 ? Math.min(Math.max(-rect.top / span, 0), 1) : 0;
        for (const spec of PANELS) {
          const node = innerRefs.current.get(spec.id);
          if (!node) continue;
          const t = panelT(spec, p);
          node.style.opacity = t.toFixed(3);
          node.style.transform = `translateY(${((1 - t) * 24).toFixed(1)}px)`;
          node.style.pointerEvents = t > 0.5 ? 'auto' : 'none';
        }
        if (!countersOnRef.current && p >= BEATS[3].range[0]) {
          countersOnRef.current = true;
          setCountersOn(true);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const setInner = (id: string) => (node: HTMLDivElement | null) => {
    if (node) innerRefs.current.set(id, node);
    else innerRefs.current.delete(id);
  };

  const pains = [
    { title: 'Lead-uri care scapă', body: 'Clienți care întreabă seara și cumpără de la altcineva dimineața.' },
    { title: 'Follow-up manual, uitat', body: 'Mesaje trimise doar când îți aduci aminte.' },
    { title: 'Zero vizibilitate în cifre', body: 'Excel-uri pe care nu le mai înțelege nimeni.' },
  ];

  const chips = [
    { icon: <Bot size={16} className="text-[#1E94A5]" />, label: 'Asistent AI 24/7' },
    { icon: <Workflow size={16} className="text-[#1E94A5]" />, label: 'CRM + automatizări' },
    { icon: <Database size={16} className="text-[#1E94A5]" />, label: 'Reactivare bază de date' },
    { icon: <Globe size={16} className="text-[#1E94A5]" />, label: 'Web AI-driven' },
  ];

  const counterData = [
    { to: 3.5, decimals: 1, prefix: '', suffix: 'x', label: 'ROI', static: '3.5x' },
    { to: 0, decimals: 0, prefix: '', suffix: '', label: 'erori umane', static: '0' },
    { to: 40, decimals: 0, prefix: '+', suffix: '%', label: 'eficiență', static: '+40%' },
    { to: 24, decimals: 0, prefix: '', suffix: '/7', label: 'mereu activ', static: '24/7' },
  ];

  const counterCards = (size: 'md' | 'lg') =>
    counterData.map((c) => (
      <div key={c.label} className={counterCard}>
        <div className={`${size === 'lg' ? 'text-4xl' : 'text-2xl'} font-extrabold text-[#2AAF7F]`}>
          <Counter to={c.to} decimals={c.decimals} prefix={c.prefix} suffix={c.suffix} active={countersOn} />
        </div>
        <div className="text-xs uppercase tracking-wider text-slate-400 mt-1">{c.label}</div>
      </div>
    ));

  const staticCounterCards = counterData.map((c) => (
    <div key={c.label} className={counterCard}>
      <div className="text-4xl font-extrabold text-[#2AAF7F]">{c.static}</div>
      <div className="text-xs uppercase tracking-wider text-slate-400 mt-1">{c.label}</div>
    </div>
  ));

  const content: Record<string, React.ReactNode> = {
    'wake-headline': (
      <>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs font-mono uppercase tracking-widest text-[#39B5C4] mb-5">
          Sistem de automatizare AI
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">Motorul de Clienți Noi</h1>
        <p className="mt-4 text-slate-300 text-lg md:text-xl">Sisteme AI care lucrează non-stop pentru afacerea ta</p>
        <div className="mt-7">
          <CtaButton onClick={onPrimaryCta}>Activează Sistemul</CtaButton>
        </div>
      </>
    ),
    'wake-cue': (
      <div className="flex flex-col items-center gap-1 text-slate-500 text-xs uppercase tracking-widest">
        <span>derulează</span>
        <span className="animate-bounce">↓</span>
      </div>
    ),
    'helper-title': <h2 className="text-3xl md:text-4xl font-bold text-white">Ce implementez</h2>,
    'helper-chip-1': <div className={chip}>{chips[0].icon}{chips[0].label}</div>,
    'helper-chip-2': <div className={chip}>{chips[1].icon}{chips[1].label}</div>,
    'helper-chip-3': <div className={chip}>{chips[2].icon}{chips[2].label}</div>,
    'helper-chip-4': <div className={chip}>{chips[3].icon}{chips[3].label}</div>,
    'chaos-title': <h2 className="text-3xl md:text-4xl font-bold text-white">Haosul de azi</h2>,
    'chaos-pain-1': (
      <div className={painCard}>
        <div className="flex items-center gap-2 text-white font-semibold text-sm"><X size={14} className="text-red-400" />{pains[0].title}</div>
        <p className="text-slate-400 text-xs mt-1">{pains[0].body}</p>
      </div>
    ),
    'chaos-pain-2': (
      <div className={painCard}>
        <div className="flex items-center gap-2 text-white font-semibold text-sm"><X size={14} className="text-red-400" />{pains[1].title}</div>
        <p className="text-slate-400 text-xs mt-1">{pains[1].body}</p>
      </div>
    ),
    'chaos-pain-3': (
      <div className={painCard}>
        <div className="flex items-center gap-2 text-white font-semibold text-sm"><X size={14} className="text-red-400" />{pains[2].title}</div>
        <p className="text-slate-400 text-xs mt-1">{pains[2].body}</p>
      </div>
    ),
    'results-title': <h2 className="text-3xl md:text-4xl font-bold text-white">Rezultate din producție</h2>,
    'activate-cta': (
      <>
        <p className="text-[#2AAF7F] font-bold text-lg mb-4">Nu lăsa lead-uri să scape.</p>
        <CtaButton onClick={onPrimaryCta}>Activează Sistemul</CtaButton>
        <button onClick={onSecondaryCta} className="mt-3 mx-auto text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2">
          sau trimite o cerere <ArrowRight size={14} />
        </button>
      </>
    ),
  };

  // The four result counters are separate desktop panels.
  const counterPanels: Record<string, React.ReactNode> = {};
  const counterNodes = counterCards('lg');
  ['results-c1', 'results-c2', 'results-c3', 'results-c4'].forEach((id, i) => {
    counterPanels[id] = counterNodes[i];
  });

  // Mobile per-beat cards: one bottom-anchored card per beat.
  const mobileContent: Record<string, React.ReactNode> = {
    'm-wake': (
      <div className={`${glass} px-5 py-6 text-center`}>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Motorul de Clienți Noi</h1>
        <p className="mt-2 text-slate-300 text-sm">Sisteme AI care lucrează non-stop pentru afacerea ta</p>
        <div className="mt-4"><CtaButton onClick={onPrimaryCta}>Activează Sistemul</CtaButton></div>
      </div>
    ),
    'm-helper': (
      <div className={`${glass} px-5 py-5`}>
        <h2 className="text-lg font-bold text-white mb-3">Ce implementez</h2>
        <div className="grid grid-cols-2 gap-2">
          {chips.map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-xs text-white font-medium">{c.icon}{c.label}</div>
          ))}
        </div>
      </div>
    ),
    'm-chaos': (
      <div className={`${glass} border-red-500/20 px-5 py-5`}>
        <h2 className="text-lg font-bold text-white mb-3">Haosul de azi</h2>
        <ul className="space-y-2">
          {pains.map((pn) => (
            <li key={pn.title} className="flex items-start gap-2 text-xs text-slate-300"><X size={12} className="text-red-400 mt-0.5 shrink-0" />{pn.title} — {pn.body}</li>
          ))}
        </ul>
      </div>
    ),
    'm-results': (
      <div className={`${glass} border-[#2AAF7F]/25 px-5 py-5`}>
        <h2 className="text-lg font-bold text-white mb-3">Rezultate din producție</h2>
        <div className="grid grid-cols-2 gap-2">{counterCards('md')}</div>
      </div>
    ),
    'm-activate': (
      <div className={`${glass} px-5 py-6 text-center`}>
        <p className="text-[#2AAF7F] font-bold mb-3">Nu lăsa lead-uri să scape.</p>
        <CtaButton onClick={onPrimaryCta}>Activează Sistemul</CtaButton>
      </div>
    ),
  };

  const renderContent = (id: string) => content[id] ?? counterPanels[id] ?? mobileContent[id] ?? null;

  const wrapperClass = (spec: PanelSpec) =>
    spec.id.startsWith('m-')
      ? 'absolute md:hidden inset-x-4 bottom-[7vh]'
      : `absolute hidden md:block ${POS[spec.id] ?? ''}`;

  // First-paint default: beat-1 panels visible, the rest hidden (rAF corrects after hydration).
  const innerClass = (spec: PanelSpec) =>
    `will-change-transform ${spec.enterAt === 0 ? 'opacity-100' : 'opacity-0'}`;

  if (reduced) {
    // Reduced motion: no pinning — the beats stack as normal static sections.
    return (
      <section data-stage className="relative">
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 gap-4">{content['wake-headline']}</div>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 gap-5">
          {content['helper-title']}
          <div className="flex flex-wrap justify-center gap-3">{chips.map((c) => (<div key={c.label} className={chip}>{c.icon}{c.label}</div>))}</div>
        </div>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 gap-5">
          {content['chaos-title']}
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl">{['chaos-pain-1', 'chaos-pain-2', 'chaos-pain-3'].map((id) => (<div key={id}>{content[id]}</div>))}</div>
        </div>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 gap-5">
          {content['results-title']}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{staticCounterCards}</div>
        </div>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">{content['activate-cta']}</div>
      </section>
    );
  }

  return (
    <section ref={stageRef} data-stage className="relative h-[400vh] md:h-[500vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {PANELS.map((spec) => (
          <div key={spec.id} className={wrapperClass(spec)}>
            <div ref={setInner(spec.id)} className={innerClass(spec)}>
              {renderContent(spec.id)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

Note: the reduced branch deliberately uses `staticCounterCards` (plain text, no animation) — `countersOn` never flips there, and reduced-motion users should see final values immediately.

- [ ] **Step 2: Mount the stage in LandingPage and remove the old hero + pains**

In `src/app/components/LandingPage.tsx`:

2a. Add import: `import StagePanels from "./StagePanels";` and `import { useReveal } from "./useReveal";`

2b. Replace the ENTIRE hero section — from `{/* Hero Section with VSL */}` down to its closing `</section>` (the block containing the H1 `Motorul de Clienți Noi`, the pre-CTA `Nu lăsa lead-uri să scape.`, and the VSL iframe) — with:

```tsx
      {/* Act 1 — The pinned robot stage */}
      <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
      <StagePanels onPrimaryCta={handleScheduleClick} onSecondaryCta={scrollToBooking} />

      {/* Act 2 — VSL */}
      <section id="vsl" className="relative z-10 py-20 md:py-28 px-6">
        <div className="container mx-auto max-w-5xl">
          <div
            ref={vslRevealRef}
            className={`transition-all duration-700 ease-out ${vslRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.94]'}`}
          >
            <div className="relative">
              <div className="absolute -inset-10 bg-[#2AAF7F]/15 rounded-full blur-[110px] pointer-events-none" />
              <div className="absolute -inset-10 bg-[#76007D]/10 rounded-full blur-[130px] pointer-events-none" />
              <div className={`${videoExpanded ? 'fixed inset-0 z-[6000] rounded-none pointer-events-none' : 'relative z-0 rounded-2xl w-full'} group overflow-hidden bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10 transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)] transform-gpu`}>
                <div className={`${videoExpanded ? 'w-full h-full' : 'w-full aspect-video'} transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)]`}>
                  <iframe
                    title="VSL — Digitalizare & Automatizare"
                    className="w-full h-full pointer-events-auto"
                    id="hero-vsl"
                    src={videoSrc}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  {!videoExpanded && (
                    <button
                      aria-label="Play"
                      onClick={() => {
                        setVideoExpanded(true);
                        setTimeout(() => {
                          try { playerRef.current?.playVideo?.(); } catch { }
                        }, 50);
                      }}
                      className="absolute inset-0 z-[100] md:hidden"
                    />
                  )}
                </div>
              </div>
              {videoExpanded && (
                <div className="fixed inset-0 z-[6500] pointer-events-none">
                  <button
                    onClick={() => setVideoExpanded(false)}
                    className="pointer-events-auto absolute top-16 right-4 bg-white/10 text-white text-xs px-3 py-1 rounded border border-white/20 cursor-pointer"
                  >
                    Închide
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
```

(The `<Script src="https://www.youtube.com/iframe_api" .../>` tag moves out of the old hero — do not duplicate it. `videoSrc`, `videoExpanded`, `playerRef` state stay in LandingPage exactly as they are.)

2c. Add the reveal hook near the other hooks (top of the component):

```tsx
  const [vslRevealRef, vslRevealed] = useReveal<HTMLDivElement>();
```

2d. DELETE the entire pain-points section (`{/* Problemă + haos actual → Reality Check */}` block, from its `<section data-choreo="pains"...>` to its closing `</section>`) — its content now lives in stage beat 3. Keep the paragraph copy nowhere else; it is preserved in beat panels.

2e. Remove the `data-choreo="..."` attributes from ALL remaining sections (credibility, cases, services, philosophy, booking) — the new rig reads only `[data-stage]`. KEEP `ref={credSectionRef}` on the credibility section (the 👋 popup depends on it).

- [ ] **Step 3: Verify**

Run: `npm run check:stage && npm run lint && npm run build`
Expected: all pass. Then `npm run dev` + preview tools: the stage pins for 4-5 viewport heights with beat panels fading in/out around the (temporarily static, center) robot; VSL section reveals below; popup still fires at credibility; booking form intact. Mobile viewport: one bottom card per beat.

- [ ] **Step 4: Commit**

```bash
git add src/app/components/StagePanels.tsx src/app/components/LandingPage.tsx
git commit -m "feat: pinned robot stage with 5 orbiting beat panels; relocate VSL to its own act; retire hero+pains sections"
```

---

### Task 4: `StageRig` — robot synced to the stage (Scene.tsx rewrite) + v1 choreography retirement

**Files:**
- Rewrite: `src/app/components/Scene.tsx`
- Delete: `src/app/components/choreography.ts`, `scripts/choreography.check.mjs`
- Modify: `package.json` (remove the `check:choreo` script)

**Interfaces:**
- Consumes: from Task 1 — `resolveStage`, `smoothstep` from `./stage`. From Task 3 — the `[data-stage]` DOM element. Existing — `Model`/`ModelHandle` (MeshoptDecoder wiring untouched).
- Produces: `Scene` default export, no props (LandingPage's `dynamic(() => import("./Scene"), { ssr: false })` unchanged).

- [ ] **Step 1: Rewrite Scene.tsx**

Replace the entire file with:

```tsx
"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Component, Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react"
import { AdditiveBlending, BufferAttribute, BufferGeometry, MathUtils, PointLight, Points } from "three"
import Model, { ModelHandle } from "./Model"
import { resolveStage, smoothstep } from "./stage"

const FOV = 54
const BASE_Z = 5

type PointerRef = MutableRefObject<{ x: number; y: number }>

function useMediaFlags() {
  const [flags, setFlags] = useState(() => ({
    mobile: window.matchMedia("(max-width: 767px)").matches,
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  }))
  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 767px)")
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setFlags({ mobile: mqMobile.matches, reduced: mqReduced.matches })
    update()
    mqMobile.addEventListener("change", update)
    mqReduced.addEventListener("change", update)
    return () => {
      mqMobile.removeEventListener("change", update)
      mqReduced.removeEventListener("change", update)
    }
  }, [])
  return flags
}

function usePointer(enabled: boolean): PointerRef {
  const pointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    if (!enabled) return
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [enabled])
  return pointer
}

/** Stage progress 0..1 plus how far we've scrolled past the stage (px). */
function stageProgress(el: HTMLElement, vh: number): { p: number; overshoot: number } {
  const rect = el.getBoundingClientRect()
  const span = rect.height - vh
  const raw = span > 0 ? -rect.top / span : 0
  return {
    p: Math.min(Math.max(raw, 0), 1),
    overshoot: Math.max(-rect.top - span, 0),
  }
}

function StageRig({ mobile, reduced, pointer }: { mobile: boolean; reduced: boolean; pointer: PointerRef }) {
  const { camera } = useThree()
  const modelRef = useRef<ModelHandle>(null)
  const accentRef = useRef<PointLight>(null)
  const stageElRef = useRef<HTMLElement | null>(null)
  const lastClipT = useRef(-1)

  useFrame((state, delta) => {
    const g = modelRef.current?.group
    if (!g) return
    const vh = window.innerHeight
    const halfH = Math.tan((FOV * Math.PI) / 360) * BASE_Z
    const halfW = halfH * (window.innerWidth / vh)

    if (reduced) {
      // Static dock, frozen mid-pose. No travel, no bob, no follow.
      g.position.set((0.16 - 0.5) * 2 * halfW, (0.5 - 0.92) * 2 * halfH, 0)
      g.scale.setScalar(0.42)
      g.rotation.set(0, 0.3, 0)
      if (lastClipT.current !== 0.15) {
        lastClipT.current = 0.15
        modelRef.current?.setClipT(0.15)
      }
      camera.position.set(0, 0, BASE_Z)
      return
    }

    if (!stageElRef.current) {
      stageElRef.current = document.querySelector<HTMLElement>("[data-stage]")
    }
    const el = stageElRef.current
    const { p, overshoot } = el ? stageProgress(el, vh) : { p: 0, overshoot: 0 }
    // One-time transition to the corner dock over ~0.6 viewport of post-stage scroll.
    const dockT = smoothstep(overshoot / (vh * 0.6))

    const center = mobile
      ? { x: 0, y: (0.5 - 0.72) * 2 * halfH, scale: 0.62 }
      : { x: 0, y: (0.5 - 0.78) * 2 * halfH, scale: 1.05 }
    const dock = mobile
      ? { x: (0.16 - 0.5) * 2 * halfW, y: (0.5 - 0.92) * 2 * halfH, scale: 0.42 }
      : { x: (0.9 - 0.5) * 2 * halfW, y: (0.5 - 0.9) * 2 * halfH, scale: 0.4 }

    const bob = Math.sin(state.clock.elapsedTime * 1.2) * 0.05 * (1 - dockT)
    const breath = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.02 * (1 - dockT)

    const tx = MathUtils.lerp(center.x, dock.x, dockT)
    const ty = MathUtils.lerp(center.y, dock.y, dockT) + bob
    const ts = MathUtils.lerp(center.scale, dock.scale, dockT) * breath

    g.position.x = MathUtils.damp(g.position.x, tx, 5, delta)
    g.position.y = MathUtils.damp(g.position.y, ty, 5, delta)
    g.scale.setScalar(MathUtils.damp(g.scale.x, ts, 5, delta))

    // Mouse-follow on desktop, fading out as the robot docks.
    const followY = mobile ? 0 : pointer.current.x * 0.18
    const dockRotY = mobile ? 0.3 : -0.35
    g.rotation.y = MathUtils.damp(g.rotation.y, MathUtils.lerp(followY, dockRotY, dockT), 5, delta)
    g.rotation.x = MathUtils.damp(g.rotation.x, mobile ? 0 : -pointer.current.y * 0.05 * (1 - dockT), 5, delta)

    const st = resolveStage(p)
    if (st.clipT !== lastClipT.current) {
      lastClipT.current = st.clipT
      modelRef.current?.setClipT(st.clipT)
      accentRef.current?.color.setRGB(st.accentR, st.accentG, st.accentB)
    }
    camera.position.set(0, 0, BASE_Z)
  })

  return (
    <>
      <hemisphereLight args={["#39B5C4", "#000022", 0.7]} />
      <directionalLight position={[-4, 4, 6]} intensity={2.2} />
      <pointLight ref={accentRef} position={[2, 1, 3]} intensity={8} distance={14} color="#1E94A5" />
      <pointLight position={[-3, -1, 2]} intensity={4} distance={12} color="#76007D" />
      <Suspense fallback={null}>
        <Model ref={modelRef} />
      </Suspense>
    </>
  )
}

// Deterministic LCG so the cloud is identical every load (and no Math.random in render).
function ParticleCloud({ color, seed, pointer }: { color: string; seed: number; pointer: PointerRef }) {
  const ref = useRef<Points>(null)
  const geometry = useMemo(() => {
    const g = new BufferGeometry()
    const N = 100
    const pos = new Float32Array(N * 3)
    let s = seed * 16807 + 1
    const rand = () => {
      s = (s * 16807) % 2147483647
      return s / 2147483647
    }
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (rand() - 0.5) * 12
      pos[i * 3 + 1] = (rand() - 0.5) * 7
      pos[i * 3 + 2] = -1.5 + rand() * 3
    }
    g.setAttribute("position", new BufferAttribute(pos, 3))
    return g
  }, [seed])
  useFrame((state, delta) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const dir = seed % 2 === 0 ? 1 : -1
    ref.current.rotation.y = t * 0.02 * dir
    ref.current.position.y = Math.sin(t * 0.15 + seed) * 0.25
    // Subtle pointer parallax, opposite directions per cloud for depth.
    ref.current.position.x = MathUtils.damp(ref.current.position.x, pointer.current.x * 0.35 * dir, 2, delta)
  })
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color={color} size={0.035} transparent opacity={0.35} depthWrite={false} blending={AdditiveBlending} sizeAttenuation />
    </points>
  )
}

class CanvasErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.error("3D scene disabled:", err)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function Scene() {
  const { mobile, reduced } = useMediaFlags()
  const pointer = usePointer(!mobile && !reduced)
  return (
    <CanvasErrorBoundary>
      <Canvas
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
        camera={{ fov: FOV, near: 0.1, far: 100, position: [0, 0, BASE_Z] }}
        className="h-full w-full"
      >
        <StageRig mobile={mobile} reduced={reduced} pointer={pointer} />
        {!mobile && !reduced && (
          <>
            <ParticleCloud color="#1E94A5" seed={1} pointer={pointer} />
            <ParticleCloud color="#76007D" seed={2} pointer={pointer} />
          </>
        )}
      </Canvas>
    </CanvasErrorBoundary>
  )
}
```

- [ ] **Step 2: Retire the v1 choreography**

```bash
git rm src/app/components/choreography.ts scripts/choreography.check.mjs
```

In `package.json`, remove the line: `"check:choreo": "node --experimental-strip-types scripts/choreography.check.mjs",`

- [ ] **Step 3: Verify**

Run: `npm run check:stage && npm run lint && npm run build`
Expected: all pass (nothing imports choreography anymore — grep to confirm: `grep -r "choreography" src/ scripts/` must return nothing).

- [ ] **Step 4: Visual smoke test**

`npm run dev` + preview tools, desktop viewport: robot centered on the stage, breathing, following the mouse slightly (preview_eval can dispatch pointermove); scrolling through the stage scrubs the animation slowly per beat and shifts the accent light color (teal → purple → green); after the stage the robot glides once to the bottom-right corner and stays; particles drift with pointer parallax. Mobile viewport: robot upper-center on the stage, docks bottom-left after. No console errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: StageRig — robot synced to stage beats with mouse-follow and corner dock; retire v1 waypoint choreography"
```

---

### Task 5: Act 2/3 polish — reveals, badge counters, tilt cards

**Files:**
- Modify: `src/app/components/LandingPage.tsx`

**Interfaces:**
- Consumes: from Task 2 — `Counter`, `useReveal`, `TiltCard`.
- Produces: final page behavior; no new exports.

- [ ] **Step 1: Add imports and reveal hooks**

In `LandingPage.tsx` add imports: `import Counter from "./Counter";`, `import TiltCard from "./TiltCard";` (`useReveal` already imported in Task 3).

Add hooks next to `vslRevealRef`:

```tsx
  const [credRevealRef, credRevealed] = useReveal<HTMLDivElement>();
  const [casesRevealRef, casesRevealed] = useReveal<HTMLDivElement>();
  const [servicesRevealRef, servicesRevealed] = useReveal<HTMLDivElement>();
  const [philosophyRevealRef, philosophyRevealed] = useReveal<HTMLDivElement>();
  const [bookingRevealRef, bookingRevealed] = useReveal<HTMLDivElement>();
```

Reveal wrapper class convention (used in every step below):

```tsx
const revealCls = (on: boolean) => `transition-all duration-700 ease-out ${on ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`;
```

Add `revealCls` as a module-level helper above the component (after the type declarations).

- [ ] **Step 2: Credibility section reveal**

Wrap the credibility section's inner container: the `<div className="container mx-auto px-6 py-0">` inside the credibility `<section>` becomes:

```tsx
        <div ref={credRevealRef} className={`container mx-auto px-6 py-0 ${revealCls(credRevealed)}`}>
```

- [ ] **Step 3: Case-study metric badges become counters**

3a. Wrap the cases grid: `<div className="mt-6 grid sm:grid-cols-3 gap-6">` becomes:

```tsx
          <div ref={casesRevealRef} className={`mt-6 grid sm:grid-cols-3 gap-6 ${revealCls(casesRevealed)}`}>
```

3b. Replace the three static badges:

Old badge 1: `<div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2AAF7F]/10 border border-[#2AAF7F]/25 text-[#2AAF7F] text-sm font-bold"><TrendingUp size={14} /> 3.5x ROI</div>`
New:

```tsx
              <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2AAF7F]/10 border border-[#2AAF7F]/25 text-[#2AAF7F] text-sm font-bold"><TrendingUp size={14} /> <Counter to={3.5} decimals={1} suffix="x ROI" active={casesRevealed} /></div>
```

Old badge 2 (`<ShieldCheck size={14} /> 0 erori umane`) new inner: `<ShieldCheck size={14} /> <Counter to={0} suffix=" erori umane" active={casesRevealed} />`

Old badge 3 (`<Zap size={14} /> +40% eficiență`) new inner: `<Zap size={14} /> <Counter to={40} prefix="+" suffix="% eficiență" active={casesRevealed} />`

- [ ] **Step 4: Services get TiltCard**

Wrap EACH of the four service cards (the `<div className="relative p-8 rounded-xl bg-[#39B5C4]/10 ...">` blocks and the premium `<div className="relative p-8 rounded-2xl bg-[#00FFFF]/8 ...">` block) in `<TiltCard>...</TiltCard>`. On the three standard cards, remove the `hover:translate-x-2 transition-transform` classes (tilt replaces that hover). Also wrap the services right column for reveal: `<div className="lg:col-span-2 space-y-6">` becomes:

```tsx
            <div ref={servicesRevealRef} className={`lg:col-span-2 space-y-6 ${revealCls(servicesRevealed)}`}>
```

- [ ] **Step 5: Philosophy + booking reveals**

Philosophy: `<div className="container mx-auto max-w-6xl relative z-10">` (inside `#philosophy`) becomes:

```tsx
        <div ref={philosophyRevealRef} className={`container mx-auto max-w-6xl relative z-10 ${revealCls(philosophyRevealed)}`}>
```

Booking: `<div className="container mx-auto max-w-4xl text-center">` (inside `#booking`) becomes:

```tsx
        <div ref={bookingRevealRef} className={`container mx-auto max-w-4xl text-center ${revealCls(bookingRevealed)}`}>
```

- [ ] **Step 6: Verify + commit**

Run: `npm run check:stage && npm run lint && npm run build` — all pass.
`npm run dev`: sections fade up as you reach them; case badges count up once; service cards tilt toward the cursor (desktop); premium card keeps its shimmer button.

```bash
git add src/app/components/LandingPage.tsx
git commit -m "feat: act 2/3 polish — scroll reveals, counting metric badges, 3D tilt on service cards"
```

---

### Task 6: Visual tuning + full verification pass

**Files:**
- Modify (numbers only): `src/app/components/stage.ts` (BEATS/PANELS windows), `src/app/components/StagePanels.tsx` (POS map), `src/app/components/Scene.tsx` (center/dock pose constants)

**Interfaces:** consumes everything; produces the final tuned experience.

- [ ] **Step 1: Battery**

Run: `npm run check:stage && npm run lint && npm run build`
Expected: all pass.

- [ ] **Step 2: Desktop pass (1280x800 and 1920x1080)**

Walk the stage slowly (preview_eval scrolls in ~400px steps + screenshots). Acceptance per beat:
1. wake: headline/CTA readable ABOVE the robot, never covering his face; cue at bottom; CTA clickable.
2. helper: 4 chips clearly around the robot, no overlap with him or each other.
3. chaos: 3 pain cards readable, red accents visible, robot's agitated segment plays.
4. results: 4 counters visible and counting exactly once (re-scroll must not re-trigger), sea-green light on the robot.
5. activate: CTA prominent below the robot, both buttons clickable.
6. Post-stage: robot glides to bottom-right corner ONCE, no jitter, stays out of the way of all Act 2/3 content.
7. VSL reveals and plays; credibility popup fires; badges count; tilt works; form submits (fill + submit via preview_fill/preview_click, expect the success/error message row to appear).
8. Zero console errors; smooth scrolling (no dropped-frame feel on the preview).

Fix by editing ONLY: `POS` classes (panel placement), BEATS/PANELS numbers (pacing/windows), center/dock constants (robot size/position). `npm run check:stage` must keep passing after every stage.ts edit.

- [ ] **Step 3: Mobile pass (375x812)**

One bottom card per beat, readable, never covering the robot (upper-center); CTA tap-able; after the stage the robot docks bottom-left small; no horizontal scroll; no particles.

- [ ] **Step 4: Reduced-motion check**

Code-verify the three paths (StagePanels reduced branch renders static sections; StageRig reduced branch docks statically; useReveal/Counter render final states). Attempt DevTools emulation via preview tooling; if unavailable, state code-verified-only in the report for the user's manual QA.

- [ ] **Step 5: Final commit**

```bash
git add src/app/components/stage.ts src/app/components/StagePanels.tsx src/app/components/Scene.tsx
git commit -m "polish: tune stage beats, panel positions and robot poses after visual pass"
```

(If zero tuning was needed, skip the commit and say so.)
