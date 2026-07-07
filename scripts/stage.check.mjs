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

// Panels starting at p=0 are fully visible on load (no fade-in at the top).
const headline = PANELS.find((s) => s.id === "wake-headline");
assert.equal(panelT(headline, 0), 1, "wake-headline visible at p=0");
assert.ok(panelT(headline, headline.exitAt + 0.01) === 0, "wake-headline still exits");

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
