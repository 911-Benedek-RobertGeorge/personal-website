# Robot Scroll Choreography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The existing 3D robot travels through the viewport as the visitor scrolls, reacting to each section of the landing page, with mobile/reduced-motion fallbacks, a compressed GLB, and small approved content touch-ups.

**Architecture:** A pure-math choreography module (`choreography.ts`) turns DOM-measured section positions into a keyframe timeline; a rig component inside the R3F canvas resolves the pose each frame and applies it to the robot group, camera, and accent light. The canvas becomes a full-viewport, click-through overlay. Spec: `docs/superpowers/specs/2026-07-05-robot-scroll-choreography-design.md`.

**Tech Stack:** Next.js 16 (App Router), React 19, @react-three/fiber 9.0.0-rc.1, three 0.163, Tailwind 3.4, lucide-react. Node 22.17.1.

## Global Constraints

- Do NOT bump any dependency version. React 19 + R3F 9.0.0-rc.1 + three 0.163 stay exactly as-is.
- **NO new dependencies at all** (deviation from spec, surfaced to user at plan review: `@react-three/drei` was allowed but is dropped — a hand-rolled 6-line idle float + plain three lights deliver the approved visuals with zero deps. Add drei later only if IBL reflections are wanted). `@gltf-transform/cli` runs one-shot via `npx`, never installed.
- Brand colors, verbatim: teal `#1E94A5` (light variant `#39B5C4`), purple `#76007D`, sea green `#2AAF7F`, LinkedIn blue `#0077b5`, page navy `#000022`.
- All user-visible copy is Romanian with diacritics preserved. New strings, verbatim: `Nu lăsa lead-uri să scape.`, `Date din producție`, `3.5x ROI`, `0 erori umane`, `+40% eficiență`.
- The 3D canvas overlay is `fixed inset-0 z-[999] pointer-events-none` — it must NEVER intercept clicks. Layering context: sections `z-10`, logo `z-40`, expanded video `z-[6000]`, navbar `z-[7000]`.
- The robot must never cover text or interactive elements — waypoints route through layout gutters (tuned in Task 6).
- Canvas `dpr` stays capped at `[1, 1.5]`.
- The check script runs with `node --experimental-strip-types` (Node 22.17 has flagged type-stripping). The script itself is `.mjs` so Next's `tsc` pass (which includes `**/*.ts`) never sees it.
- Commit after every task, on the current worktree branch. Never push.
- `npm run lint` and `npm run build` must pass at the end of every task that touches `src/` or config.

---

### Task 1: Choreography core (pure math) + runnable check

**Files:**
- Create: `src/app/components/choreography.ts`
- Create: `scripts/choreography.check.mjs`
- Modify: `package.json` (add `check:choreo` script)

**Interfaces:**
- Consumes: nothing (pure module, zero imports — deliberately no three.js so plain node can run it).
- Produces (used by Task 4's Scene rig):
  - `type Pose = { x; y; scale; rotY; clipT; camX; camY; camZ; accentR; accentG; accentB }` (all `number`)
  - `type SectionSpec = { id: string; nx: number; ny: number; scale: number; rotY: number; clip: [number, number]; cam: [number, number, number]; accent: string }`
  - `type SectionRect = { id: string; top: number; height: number }`
  - `type Keyframe = { at: number; pose: Pose }`
  - `const SECTIONS: SectionSpec[]` — the storyboard data, ids: `hero`, `credibility`, `pains`, `cases`, `services`, `philosophy`, `booking`
  - `function buildTimeline(specs: SectionSpec[], rects: SectionRect[], vh: number, halfW: number, halfH: number): Keyframe[]`
  - `function resolvePose(timeline: Keyframe[], scrollY: number): Pose`
  - `function smoothstep(t: number): number`
  - `function hexToRgb(hex: string): [number, number, number]`

- [ ] **Step 1: Write the failing check script**

Create `scripts/choreography.check.mjs`:

```js
// Runnable check for the pure choreography math. No test framework — plain node asserts.
// Run: npm run check:choreo
import assert from "node:assert/strict";
import {
  SECTIONS,
  buildTimeline,
  resolvePose,
  smoothstep,
  hexToRgb,
} from "../src/app/components/choreography.ts";

const vh = 800;
const halfW = 4;
const halfH = 2.5;

// Synthetic page: each section 1000px apart, 900px tall.
const rects = SECTIONS.map((s, i) => ({ id: s.id, top: i * 1000, height: 900 }));
const tl = buildTimeline(SECTIONS, rects, vh, halfW, halfH);

// Two keyframes per section (enter at 15%, exit at 85% of the section).
assert.equal(tl.length, SECTIONS.length * 2, "two keyframes per section");

// Anchors strictly ascending for non-overlapping sections.
for (let i = 1; i < tl.length; i++) {
  assert.ok(tl[i].at > tl[i - 1].at, `anchor ${i} must ascend`);
}

// Enter/exit keyframes of a section hold the same position (robot acts in place).
assert.equal(tl[0].pose.x, tl[1].pose.x, "position held within section");
assert.equal(tl[0].pose.y, tl[1].pose.y, "position held within section");

// Clamped before the first and after the last anchor.
assert.deepEqual(resolvePose(tl, -99999), tl[0].pose, "clamp low");
assert.deepEqual(resolvePose(tl, 10 ** 9), tl[tl.length - 1].pose, "clamp high");

// Midpoint between two anchors interpolates halfway (smoothstep(0.5) === 0.5).
const mid = (tl[0].at + tl[1].at) / 2;
const p = resolvePose(tl, mid);
const expectedClipT = (tl[0].pose.clipT + tl[1].pose.clipT) / 2;
assert.ok(Math.abs(p.clipT - expectedClipT) < 1e-9, "midpoint lerp");

// A section whose DOM anchor is missing is skipped, not fatal.
const tl2 = buildTimeline(SECTIONS, rects.slice(1), vh, halfW, halfH);
assert.equal(tl2.length, (SECTIONS.length - 1) * 2, "missing rect skipped");

// smoothstep boundary behavior.
assert.equal(smoothstep(0), 0);
assert.equal(smoothstep(1), 1);
assert.equal(smoothstep(0.5), 0.5);
assert.equal(smoothstep(-5), 0, "clamped below");
assert.equal(smoothstep(5), 1, "clamped above");

// hexToRgb produces 0..1 channels.
const [r, g, b] = hexToRgb("#2AAF7F");
assert.ok(Math.abs(r - 42 / 255) < 1e-9);
assert.ok(Math.abs(g - 175 / 255) < 1e-9);
assert.ok(Math.abs(b - 127 / 255) < 1e-9);

// Viewport-normalized -> world mapping: nx=0.5 must be world x=0.
const centered = buildTimeline(
  [{ ...SECTIONS[0], nx: 0.5, ny: 0.5 }],
  [{ id: SECTIONS[0].id, top: 0, height: 900 }],
  vh,
  halfW,
  halfH
);
assert.equal(centered[0].pose.x, 0, "nx 0.5 is world center");
assert.equal(centered[0].pose.y, 0, "ny 0.5 is world center");

console.log("choreography check: OK");
```

- [ ] **Step 2: Add the npm script and run the check to verify it fails**

In `package.json`, add to `"scripts"`:

```json
    "check:choreo": "node --experimental-strip-types scripts/choreography.check.mjs"
```

Run: `npm run check:choreo`
Expected: FAIL — `Cannot find module` for `../src/app/components/choreography.ts` (module doesn't exist yet). An `ExperimentalWarning: Type Stripping` on stderr is normal and not a failure.

- [ ] **Step 3: Implement the choreography module**

Create `src/app/components/choreography.ts`:

```ts
// Pure scroll-choreography math. Deliberately imports nothing (no three.js)
// so `scripts/choreography.check.mjs` can run it with plain node.

export type Pose = {
  x: number;
  y: number;
  scale: number;
  rotY: number;
  clipT: number;
  camX: number;
  camY: number;
  camZ: number;
  accentR: number;
  accentG: number;
  accentB: number;
};

export type SectionSpec = {
  id: string;
  /** Robot feet position, viewport-normalized: 0..1 from left / from top. */
  nx: number;
  ny: number;
  scale: number;
  /** Y rotation in radians. Positive faces the robot to its left (screen right). */
  rotY: number;
  /** Window of the GLB animation clip scrubbed while this section is in view. */
  clip: [number, number];
  /** Camera offset [x, y, z] from its base position. */
  cam: [number, number, number];
  /** Accent point-light hex color while this section is in view. */
  accent: string;
};

export type SectionRect = { id: string; top: number; height: number };

export type Keyframe = { at: number; pose: Pose };

// The approved storyboard. Clip windows are sequential so the dance clip
// plays continuously across the whole page. Numbers tuned in Task 6.
export const SECTIONS: SectionSpec[] = [
  { id: "hero",        nx: 0.10, ny: 0.68, scale: 0.85, rotY:  0.35, clip: [0.00, 0.18], cam: [0, 0, 0],     accent: "#1E94A5" },
  { id: "credibility", nx: 0.85, ny: 0.55, scale: 0.65, rotY: -0.45, clip: [0.18, 0.34], cam: [0.2, 0, 0],   accent: "#0077b5" },
  { id: "pains",       nx: 0.30, ny: 0.60, scale: 0.75, rotY:  0.55, clip: [0.34, 0.50], cam: [0, 0, 0],     accent: "#76007D" },
  { id: "cases",       nx: 0.82, ny: 0.62, scale: 0.75, rotY: -0.50, clip: [0.50, 0.64], cam: [-0.2, 0, 0],  accent: "#2AAF7F" },
  { id: "services",    nx: 0.14, ny: 0.66, scale: 0.60, rotY:  0.40, clip: [0.64, 0.76], cam: [0.2, 0, 0],   accent: "#1E94A5" },
  { id: "philosophy",  nx: 0.52, ny: 0.70, scale: 0.70, rotY:  0.00, clip: [0.76, 0.88], cam: [0, 0, 0],     accent: "#76007D" },
  { id: "booking",     nx: 0.72, ny: 0.60, scale: 0.90, rotY: -0.30, clip: [0.88, 1.00], cam: [0, 0, -0.6],  accent: "#2AAF7F" },
];

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function smoothstep(t: number): number {
  const c = Math.min(Math.max(t, 0), 1);
  return c * c * (3 - 2 * c);
}

function specToPose(s: SectionSpec, clipT: number, halfW: number, halfH: number): Pose {
  const [accentR, accentG, accentB] = hexToRgb(s.accent);
  return {
    x: (s.nx - 0.5) * 2 * halfW,
    y: (0.5 - s.ny) * 2 * halfH,
    scale: s.scale,
    rotY: s.rotY,
    clipT,
    camX: s.cam[0],
    camY: s.cam[1],
    camZ: s.cam[2],
    accentR,
    accentG,
    accentB,
  };
}

/**
 * Two keyframes per section that has a measured DOM rect (missing rects are
 * skipped): the pose is reached when the viewport center crosses 15% of the
 * section, held until 85%, while the clip window scrubs t0 -> t1. Because the
 * anchors are viewport-center crossings of non-overlapping sections, they are
 * strictly ascending. Travel between sections happens in the 85% -> next 15%
 * gap, where both position and clip time lerp.
 */
export function buildTimeline(
  specs: SectionSpec[],
  rects: SectionRect[],
  vh: number,
  halfW: number,
  halfH: number
): Keyframe[] {
  const byId = new Map(rects.map((r) => [r.id, r]));
  const out: Keyframe[] = [];
  for (const s of specs) {
    const r = byId.get(s.id);
    if (!r) continue;
    out.push({ at: r.top + 0.15 * r.height - 0.5 * vh, pose: specToPose(s, s.clip[0], halfW, halfH) });
    out.push({ at: r.top + 0.85 * r.height - 0.5 * vh, pose: specToPose(s, s.clip[1], halfW, halfH) });
  }
  return out;
}

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const out = { ...a };
  for (const k of Object.keys(a) as (keyof Pose)[]) {
    out[k] = a[k] + (b[k] - a[k]) * t;
  }
  return out;
}

export function resolvePose(timeline: Keyframe[], scrollY: number): Pose {
  if (timeline.length === 0) throw new Error("resolvePose: empty timeline");
  if (scrollY <= timeline[0].at) return timeline[0].pose;
  const last = timeline[timeline.length - 1];
  if (scrollY >= last.at) return last.pose;
  let i = 1;
  while (timeline[i].at < scrollY) i++;
  const a = timeline[i - 1];
  const b = timeline[i];
  const span = b.at - a.at;
  const t = span > 0 ? smoothstep((scrollY - a.at) / span) : 1;
  return lerpPose(a.pose, b.pose, t);
}
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `npm run check:choreo`
Expected: `choreography check: OK`, exit code 0.

- [ ] **Step 5: Verify Next still typechecks/builds with the new module**

Run: `npm run build`
Expected: build succeeds (the module is dead code until Task 4 — that's fine).

- [ ] **Step 6: Commit**

```bash
git add src/app/components/choreography.ts scripts/choreography.check.mjs package.json
git commit -m "feat: pure choreography math (timeline + pose resolver) with runnable check"
```

---

### Task 2: Compress the robot GLB + wire the meshopt decoder

**Files:**
- Modify: `public/robot_playground.glb` (8.7MB → target ≤2MB)
- Modify: `src/app/components/Model.tsx:1-60` (loader gets MeshoptDecoder — 3 lines)
- Possibly modify: `src/app/types/three-examples.d.ts` (only if TS lacks meshopt types)

**Interfaces:**
- Consumes: nothing from other tasks (independent).
- Produces: the same `/robot_playground.glb` URL, now meshopt-compressed with WebP textures. Task 4's rewritten Model MUST keep the `setMeshoptDecoder` call added here.

- [ ] **Step 1: Inspect the GLB to see where the bytes are**

Run: `npx --yes @gltf-transform/cli inspect public/robot_playground.glb`
Expected: a table of meshes/textures/animations with sizes. Note the totals for comparison.

- [ ] **Step 2: Optimize to a new file (never in-place)**

Run: `npx --yes @gltf-transform/cli optimize public/robot_playground.glb public/robot_playground.opt.glb --compress meshopt --texture-compress webp`
Expected: exit 0, `public/robot_playground.opt.glb` created.

Meshopt (not Draco) because three bundles `MeshoptDecoder` as a plain module — no decoder binaries to copy into `public/`.

- [ ] **Step 3: Verify the size win**

Run: `ls -la public/robot_playground.glb public/robot_playground.opt.glb`
Expected: optimized file dramatically smaller (target ≤2MB). If it is NOT under ~4MB, try adding `--simplify 0.75`; if still poor, stop and keep the original (spec allows this fallback) — skip Steps 4-6, delete the .opt.glb, and note the outcome in the commit/report.

- [ ] **Step 4: Wire the meshopt decoder into the CURRENT Model.tsx**

In `src/app/components/Model.tsx`, change the imports:

```ts
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js"
```

and in the load effect, right after `const loader = new GLTFLoader()`:

```ts
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
```

If TypeScript cannot find types for the meshopt module, append to `src/app/types/three-examples.d.ts`:

```ts
declare module "three/addons/libs/meshopt_decoder.module.js" {
  export const MeshoptDecoder: unknown;
}
```

(Only add this if `npm run build` complains — @types/three 0.181 usually ships these types.)

- [ ] **Step 5: Swap the file and verify visually**

```bash
mv public/robot_playground.opt.glb public/robot_playground.glb
```

(The original is recoverable via `git checkout -- public/robot_playground.glb`.)

Start the dev server and look at the robot: `npm run dev` → open `http://localhost:3000`.
Expected: robot renders and scroll-scrubs exactly as before — no missing limbs, no black/blown-out textures. If quality is visibly degraded: `git checkout -- public/robot_playground.glb`, keep the decoder wiring (harmless), and note the fallback in the commit message.

- [ ] **Step 6: Build check**

Run: `npm run lint` then `npm run build`
Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add public/robot_playground.glb src/app/components/Model.tsx src/app/types/three-examples.d.ts
git commit -m "perf: meshopt-compress robot GLB (8.7MB -> <size>MB) + wire MeshoptDecoder"
```

(Replace `<size>` with the real number.)

---

### Task 3: Section anchors, popup unification, content touch-ups, config cleanup

**Files:**
- Modify: `src/app/components/LandingPage.tsx` (anchors at lines ~193, 279, 343, 444, 492, 605, 696; popup effect at lines 35-50; hero CTA row ~line 215; case-studies ~lines 445-467; lucide imports lines 3-17)
- Delete: `next.config.mjs` (stale duplicate — the empty `.mjs` currently SHADOWS `next.config.ts`, so `transpilePackages: ["three"]` is silently inactive)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `data-choreo` attributes (`hero`, `credibility`, `pains`, `cases`, `services`, `philosophy`, `booking`) that Task 4's rig queries via `document.querySelector('[data-choreo="..."]')`. Section ids/attribute values MUST match `SECTIONS[].id` in `choreography.ts` exactly.

- [ ] **Step 1: Add `data-choreo` anchors to the seven sections**

In `src/app/components/LandingPage.tsx`, edit each opening tag (exact old → new):

1. Hero: `<section className="relative z-10 border-y border-white/10 bg-[#39B5C4]/5 backdrop-blur-xl overflow-hidden md:min-h-[600px] lg:min-h-[700px]">` → `<section data-choreo="hero" className="relative z-10 border-y border-white/10 bg-[#39B5C4]/5 backdrop-blur-xl overflow-hidden md:min-h-[600px] lg:min-h-[700px]">`
2. Credibility: `<section className="relative z-10 border-y border-white/5 bg-[#39B5C4]/8 backdrop-blur-xl">` → `<section data-choreo="credibility" ref={credSectionRef} className="relative z-10 border-y border-white/5 bg-[#39B5C4]/8 backdrop-blur-xl">`
3. Pains: `<section className="relative z-10 py-20 md:py-24 px-6 border-y border-white/5">` → `<section data-choreo="pains" className="relative z-10 py-20 md:py-24 px-6 border-y border-white/5">`
4. Cases: `<section id="case-studies" className="relative z-10 py-24 px-6 bg-[#39B5C4]/8 backdrop-blur-xl">` → `<section id="case-studies" data-choreo="cases" className="relative z-10 py-24 px-6 bg-[#39B5C4]/8 backdrop-blur-xl">`
5. Services: `<section id="services" className="relative z-10 py-24 px-6">` → `<section id="services" data-choreo="services" className="relative z-10 py-24 px-6">`
6. Philosophy: `<section id="philosophy" className="relative z-10 py-24 px-6 text-[#E5E7EB] font-sans selection:bg-[#76007D] selection:text-white overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#000045] via-[#000025] to-[#000010]">` → same tag with `id="philosophy" data-choreo="philosophy"` inserted after `id="philosophy"`
7. Booking: `<section id="booking" className="relative z-10 py-24 px-6">` → `<section id="booking" data-choreo="booking" className="relative z-10 py-24 px-6">`

- [ ] **Step 2: Unify the LinkedIn popup trigger with the credibility section**

Replace the entire first `useEffect` (the `window.scrollY > 600` one, lines 35-50):

Old:

```tsx
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600 && !hasScrolledPast) {
        setShowInitialPopup(true);
        setHasScrolledPast(true);

        const timer = setTimeout(() => {
          setShowInitialPopup(false);
        }, 3000);

        return () => clearTimeout(timer);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolledPast]);
```

New:

```tsx
  const credSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (hasScrolledPast) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const handleScroll = () => {
      const el = credSectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Same trigger the robot choreography uses: the section entering view.
      if (rect.top < window.innerHeight * 0.55 && rect.bottom > 0) {
        setShowInitialPopup(true);
        setHasScrolledPast(true);
        timer = setTimeout(() => setShowInitialPopup(false), 3000);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timer) clearTimeout(timer);
    };
  }, [hasScrolledPast]);
```

(This also fixes a latent bug: the old code returned a cleanup function from inside the scroll handler, where it did nothing.)

- [ ] **Step 3: Hero pre-CTA line**

Old:

```tsx
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
```

New:

```tsx
              <p className="mt-6 text-[#2AAF7F] font-bold text-base tracking-wide">Nu lăsa lead-uri să scape.</p>
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
```

- [ ] **Step 4: Case-studies eyebrow + metric badges**

4a. Add `TrendingUp` to the lucide-react import block:

Old:

```tsx
  Zap,
  CheckCircle2,
```

New:

```tsx
  Zap,
  TrendingUp,
  CheckCircle2,
```

4b. Eyebrow — old:

```tsx
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Cum arată digitalizarea în practică?</h2>
```

New:

```tsx
        <div className="container mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2AAF7F]/30 bg-[#2AAF7F]/10 text-[#2AAF7F] text-xs font-mono uppercase tracking-widest mb-4">Date din producție</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Cum arată digitalizarea în practică?</h2>
```

4c. Badge on card 1 ("Mina de Aur Abandonată") — after this exact line:

```tsx
              <p className="mt-3 text-slate-300">Ai sute de numere vechi. Nu ai timp să le suni. Sistem AI care trimite mesaje personalizate și empatice tuturor. Clienți vechi se reîntorc în 24 de ore, fără reclame.</p>
```

insert:

```tsx
              <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2AAF7F]/10 border border-[#2AAF7F]/25 text-[#2AAF7F] text-sm font-bold"><TrendingUp size={14} /> 3.5x ROI</div>
```

4d. Badge on card 2 ("Secretara Virtuală...") — after:

```tsx
              <p className="mt-3 text-slate-300">Pierzi clienți pentru că nu răspunzi în weekend/seara. Asistentul AI răspunde la întrebări și face programarea direct în calendarul tău.</p>
```

insert:

```tsx
              <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2AAF7F]/10 border border-[#2AAF7F]/25 text-[#2AAF7F] text-sm font-bold"><ShieldCheck size={14} /> 0 erori umane</div>
```

4e. Badge on card 3 ("Marketingul care nu uită") — after:

```tsx
              <p className="mt-3 text-slate-300">Plătești reclame, oamenii intră pe site, dar nu cumpără. Sistemul trimite mail/SMS util timp de 2 săptămâni până când sunt gata să cumpere.</p>
```

insert:

```tsx
              <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2AAF7F]/10 border border-[#2AAF7F]/25 text-[#2AAF7F] text-sm font-bold"><Zap size={14} /> +40% eficiență</div>
```

(`ShieldCheck` and `Zap` are already imported.)

- [ ] **Step 5: Remove the stale duplicate Next config**

```bash
git rm next.config.mjs
```

`next.config.ts` (with `transpilePackages: ["three"]`) becomes the single active config.

- [ ] **Step 6: Verify**

Run: `npm run lint` then `npm run build`
Expected: both pass. Then `npm run dev`, open `http://localhost:3000` and check: pre-CTA line visible in hero, eyebrow + 3 sea-green badges in case studies, LinkedIn popup fires when the credibility bar scrolls into view (not at a magic 600px).

- [ ] **Step 7: Commit**

```bash
git add src/app/components/LandingPage.tsx
git commit -m "feat: choreography anchors, section-based popup trigger, approved content touch-ups, drop stale next.config.mjs"
```

---

### Task 4: 3D layer rewrite — Model handle, Scene rig, full-viewport overlay, mobile/reduced modes

**Files:**
- Rewrite: `src/app/components/Model.tsx`
- Rewrite: `src/app/components/Scene.tsx`
- Modify: `src/app/components/LandingPage.tsx:143-146` (overlay container)

**Interfaces:**
- Consumes: from Task 1 — `SECTIONS`, `buildTimeline`, `resolvePose`, `Keyframe` via `import { SECTIONS, buildTimeline, resolvePose, type Keyframe } from "./choreography"`. From Task 3 — the `data-choreo` DOM attributes. From Task 2 — MeshoptDecoder wiring (must be preserved in the rewrite).
- Produces: `ModelHandle = { group: Group | null; setClipT: (t: number) => void }` exported from `Model.tsx` (used by Scene only). `Scene` keeps its default export with no props (LandingPage's dynamic import stays unchanged).

- [ ] **Step 1: Rewrite Model.tsx — loader + imperative clip control, no self-transform**

Replace the entire file `src/app/components/Model.tsx` with:

```tsx
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { AnimationAction, AnimationClip, AnimationMixer, Group, LoopOnce, Object3D } from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js"

export type ModelHandle = {
  group: Group | null
  /** Scrub the GLB animation to fraction t (0..1) of the clip. */
  setClipT: (t: number) => void
}

// Loads the robot and exposes imperative control to the ChoreoRig in Scene.tsx.
// Position/rotation/scale are owned by the rig; this component only loads and scrubs.
const Model = forwardRef<ModelHandle>(function Model(_props, ref) {
  const group = useRef<Group>(null)
  const [gltfScene, setGltfScene] = useState<Object3D | null>(null)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const clipRef = useRef<AnimationClip | null>(null)
  const actionRef = useRef<AnimationAction | null>(null)

  useImperativeHandle(
    ref,
    () => ({
      get group() {
        return group.current
      },
      setClipT: (t: number) => {
        const mixer = mixerRef.current
        const clip = clipRef.current
        const action = actionRef.current
        if (!mixer || !clip || !action) return
        action.time = Math.max(0, Math.min(clip.duration * t, clip.duration))
        mixer.update(0)
      },
    }),
    []
  )

  useEffect(() => {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    loader.load(
      "/robot_playground.glb",
      (gltf) => {
        setGltfScene(gltf.scene)
        gltf.scene.frustumCulled = false
        gltf.scene.traverse((obj) => {
          obj.frustumCulled = false
        })
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new AnimationMixer(gltf.scene)
          mixerRef.current = mixer
          const clip = gltf.animations[0]
          clipRef.current = clip
          const action = mixer.clipAction(clip)
          actionRef.current = action
          action.reset()
          action.setLoop(LoopOnce, 0)
          action.clampWhenFinished = true
          action.enabled = true
          action.play()
          action.paused = true
          action.time = 0
          mixer.update(0)
        } else {
          console.warn("GLTF loaded without animations; scrubbing will have no effect.")
        }
      },
      undefined,
      (err) => {
        console.error("Failed to load GLTF:", err)
      }
    )
  }, [])

  return <group ref={group}>{gltfScene && <primitive object={gltfScene} />}</group>
})

export default Model
```

- [ ] **Step 2: Rewrite Scene.tsx — rig, lights, media-flag modes**

Replace the entire file `src/app/components/Scene.tsx` with:

```tsx
"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { PointLight } from "three"
import Model, { ModelHandle } from "./Model"
import { SECTIONS, buildTimeline, resolvePose, type Keyframe, type Pose } from "./choreography"

const FOV = 54
const BASE_Z = 5

function useMediaFlags() {
  const [flags, setFlags] = useState({ mobile: false, reduced: false })
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

function ChoreoRig({ mobile, reduced }: { mobile: boolean; reduced: boolean }) {
  const { camera } = useThree()
  const modelRef = useRef<ModelHandle>(null)
  const accentRef = useRef<PointLight>(null)
  const timelineRef = useRef<Keyframe[]>([])
  const dimsRef = useRef({ halfW: 1, halfH: 1 })
  const pageHRef = useRef(0)
  const lastScrollRef = useRef(-1)
  const poseRef = useRef<Pose | null>(null)

  const rebuild = useCallback(() => {
    const vh = window.innerHeight
    const halfH = Math.tan((FOV * Math.PI) / 360) * BASE_Z
    const halfW = halfH * (window.innerWidth / vh)
    dimsRef.current = { halfW, halfH }
    const rects: { id: string; top: number; height: number }[] = []
    for (const s of SECTIONS) {
      const el = document.querySelector(`[data-choreo="${s.id}"]`)
      if (!el) continue
      const r = el.getBoundingClientRect()
      rects.push({ id: s.id, top: r.top + window.scrollY, height: r.height })
    }
    timelineRef.current = buildTimeline(SECTIONS, rects, vh, halfW, halfH)
    pageHRef.current = document.documentElement.scrollHeight
    lastScrollRef.current = -1 // invalidate the cached pose
  }, [])

  useEffect(() => {
    rebuild()
    window.addEventListener("resize", rebuild)
    return () => window.removeEventListener("resize", rebuild)
  }, [rebuild])

  useFrame((state) => {
    // Re-measure when the page height changes (images/embeds finished loading).
    if (document.documentElement.scrollHeight !== pageHRef.current) rebuild()

    const g = modelRef.current?.group
    if (!g) return
    const { halfW, halfH } = dimsRef.current

    if (mobile || reduced) {
      // ponytail: docked mode = pre-choreography behavior; the full show is desktop-only
      g.position.set((0.16 - 0.5) * 2 * halfW, (0.5 - 0.82) * 2 * halfH, 0)
      g.scale.setScalar(0.55)
      g.rotation.y = 0.3
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      const t = reduced ? 0.15 : Math.min(Math.max(window.scrollY / maxScroll, 0), 1)
      modelRef.current?.setClipT(t)
      camera.position.set(0, 0, BASE_Z)
      return
    }

    const tl = timelineRef.current
    if (tl.length === 0) return
    // Spec: skip pose work when scroll hasn't moved. Only the idle bob is per-frame.
    const scrollY = window.scrollY
    const scrollChanged = scrollY !== lastScrollRef.current || poseRef.current === null
    if (scrollChanged) {
      lastScrollRef.current = scrollY
      poseRef.current = resolvePose(tl, scrollY)
    }
    const pose = poseRef.current as Pose
    const bob = Math.sin(state.clock.elapsedTime * 1.4) * 0.06
    g.position.set(pose.x, pose.y + bob, 0)
    g.scale.setScalar(pose.scale)
    g.rotation.y = pose.rotY
    if (scrollChanged) {
      modelRef.current?.setClipT(pose.clipT)
      camera.position.set(pose.camX, pose.camY, BASE_Z + pose.camZ)
      accentRef.current?.color.setRGB(pose.accentR, pose.accentG, pose.accentB)
    }
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

export default function Scene() {
  const { mobile, reduced } = useMediaFlags()
  return (
    <Canvas
      gl={{ antialias: true }}
      dpr={[1, 1.5]}
      camera={{ fov: FOV, near: 0.1, far: 100, position: [0, 0, BASE_Z] }}
      className="h-full w-full"
    >
      <ChoreoRig mobile={mobile} reduced={reduced} />
    </Canvas>
  )
}
```

- [ ] **Step 3: Swap the LandingPage container to a full-viewport overlay**

In `src/app/components/LandingPage.tsx`, old:

```tsx
      {/* 3D Robot Background Canvas */}
      <div className="fixed -left-[3vw] sm:-left-[1vw] bottom-0 h-[45vh] sm:h-[55vh] w-[52vw] sm:w-[26vw] md:w-[32vw] z-[999] pointer-events-none scale-[0.8] origin-bottom-left" style={{ overflow: 'visible' }}>
        <Scene />
      </div>
```

New:

```tsx
      {/* 3D Robot Choreography Overlay */}
      <div className="fixed inset-0 z-[999] pointer-events-none">
        <Scene />
      </div>
```

- [ ] **Step 4: Verify the choreography check still passes and the app builds**

Run: `npm run check:choreo && npm run lint && npm run build`
Expected: all pass.

- [ ] **Step 5: Visual smoke test**

`npm run dev`, open `http://localhost:3000`:
- Robot visible near hero's left lower third, gently bobbing.
- Scroll: robot travels right toward the LinkedIn block, then left at pains, right at case studies, etc.; animation scrubs continuously.
- All links/buttons still clickable (overlay is click-through); video play works.
- Narrow the window below 768px: robot docks bottom-left, whole-clip scrub (old behavior).

- [ ] **Step 6: Commit**

```bash
git add src/app/components/Model.tsx src/app/components/Scene.tsx src/app/components/LandingPage.tsx
git commit -m "feat: robot scroll choreography — full-viewport rig, per-section poses, camera drift, accent lights, mobile/reduced-motion docking"
```

---

### Task 5: Depth particles (desktop only)

**Files:**
- Modify: `src/app/components/Scene.tsx` (add `ParticleCloud` + render in `Scene`)

**Interfaces:**
- Consumes: Task 4's `Scene`/`useMediaFlags` structure.
- Produces: nothing external — purely visual.

- [ ] **Step 1: Add the particle components to Scene.tsx**

Add to the imports in `src/app/components/Scene.tsx`:

```tsx
import { AdditiveBlending, BufferAttribute, BufferGeometry, PointLight, Points } from "three"
import { useMemo } from "react"
```

(Merge with the existing `react` and `three` import lines — final lines: `import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"` and `import { AdditiveBlending, BufferAttribute, BufferGeometry, PointLight, Points } from "three"`.)

Add above `export default function Scene()`:

```tsx
// Deterministic LCG so the cloud is identical every load (and no Math.random in render).
function ParticleCloud({ color, seed }: { color: string; seed: number }) {
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
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * 0.02 * (seed % 2 === 0 ? 1 : -1)
    ref.current.position.y = Math.sin(t * 0.15 + seed) * 0.25
  })
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color={color} size={0.035} transparent opacity={0.35} depthWrite={false} blending={AdditiveBlending} sizeAttenuation />
    </points>
  )
}
```

In `Scene`'s JSX, render them desktop-only, next to the rig:

```tsx
      <ChoreoRig mobile={mobile} reduced={reduced} />
      {!mobile && !reduced && (
        <>
          <ParticleCloud color="#1E94A5" seed={1} />
          <ParticleCloud color="#76007D" seed={2} />
        </>
      )}
```

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: pass.
`npm run dev`: faint teal/purple motes drifting in depth on desktop; NONE below 768px width.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/Scene.tsx
git commit -m "feat: ambient depth particles (desktop only)"
```

---

### Task 6: Waypoint tuning + full verification pass

**Files:**
- Modify: `src/app/components/choreography.ts` (SECTIONS numbers only)

**Interfaces:**
- Consumes: everything prior.
- Produces: the final tuned experience.

- [ ] **Step 1: Run the full check battery**

Run: `npm run check:choreo && npm run lint && npm run build`
Expected: all pass.

- [ ] **Step 2: Desktop visual pass — walk the whole page**

`npm run dev`, viewport ~1280x800 and ~1920x1080. At each section verify:
1. Hero: robot left lower third, does NOT overlap the H1, the CTA buttons, or the corner logo video (top-left is off-limits).
2. Credibility: robot near the LinkedIn card on the right, arriving as the 👋 popup fires — the two must read as one synchronized moment. Robot must not cover the avatar or the "Vezi Profilul" link.
3. Pains: robot center-left, not covering any red card text.
4. Cases: robot right side, clear of the third card's text and badges.
5. Services: robot small, left, under the sticky title, clear of all service cards (especially the PREMIUM card).
6. Philosophy: robot center, beside/below the terminal card, not covering the terminal text or the "TESTAT ÎN PRODUCȚIE" sticker.
7. Booking: robot beside the form, camera pushes in slightly, robot never overlaps inputs or the submit button.
8. Footer: robot settled small toward the corner.

Fix any overlap by editing ONLY the `SECTIONS` numbers (`nx`, `ny`, `scale`, `rotY`) in `choreography.ts`. Re-check `npm run check:choreo` after edits (it is layout-independent and must keep passing).

- [ ] **Step 3: Mobile visual pass**

Resize below 768px (e.g. 375x812): robot docked bottom-left at fixed size, whole-clip scrub while scrolling, no particles, nothing covered, no horizontal scroll introduced.

- [ ] **Step 4: Reduced-motion logic check**

In DevTools: Rendering → Emulate CSS prefers-reduced-motion: reduce → robot static at dock pose (clipT 0.15), no bob, no travel, no particles. (If DevTools emulation is unavailable in the harness, verify by code-reading the `mobile || reduced` branch and note it for the user's manual QA.)

- [ ] **Step 5: Performance sanity**

With DevTools performance overlay or FPS meter during continuous scroll: no sustained jank (target 60fps on a mid-range machine; the scene is one robot + 200 points, this should be trivially met). Confirm no console errors, and confirm the GLB network transfer is the compressed size.

- [ ] **Step 6: Final commit**

```bash
git add src/app/components/choreography.ts
git commit -m "polish: tune choreography waypoints after visual pass"
```

(If no tuning was needed, skip the commit and say so.)
