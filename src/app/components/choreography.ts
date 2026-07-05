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
  { id: "hero",        nx: 0.38, ny: 0.86, scale: 0.55, rotY:  0.35, clip: [0.00, 0.18], cam: [0, 0, 0],     accent: "#1E94A5" },
  { id: "credibility", nx: 0.66, ny: 0.55, scale: 0.42, rotY:  0.45, clip: [0.18, 0.34], cam: [0.2, 0, 0],   accent: "#0077b5" },
  { id: "pains",       nx: 0.09, ny: 0.58, scale: 0.40, rotY:  0.55, clip: [0.34, 0.50], cam: [0, 0, 0],     accent: "#76007D" },
  { id: "cases",       nx: 0.92, ny: 0.60, scale: 0.32, rotY: -0.50, clip: [0.50, 0.64], cam: [-0.2, 0, 0],  accent: "#2AAF7F" },
  { id: "services",    nx: 0.13, ny: 0.74, scale: 0.55, rotY:  0.40, clip: [0.64, 0.76], cam: [0.2, 0, 0],   accent: "#1E94A5" },
  { id: "philosophy",  nx: 0.505, ny: 0.60, scale: 0.24, rotY:  0.00, clip: [0.76, 0.88], cam: [0, 0, 0],     accent: "#76007D" },
  { id: "booking",     nx: 0.87, ny: 0.62, scale: 0.56, rotY: -0.30, clip: [0.88, 1.00], cam: [0, 0, -0.6],  accent: "#2AAF7F" },
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
 * section, held until 85%, while the clip window scrubs t0 -> t1. Travel
 * between sections happens in the 85% -> next 15% gap, where both position
 * and clip time lerp. The result is sorted ascending by anchor, since
 * `specs` order (not DOM order) drives clip progression.
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
  out.sort((a, b) => a.at - b.at);
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
