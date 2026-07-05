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
