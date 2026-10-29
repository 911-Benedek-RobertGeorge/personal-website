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
  { id: "pains",    range: [0.18, 0.40], clip: [0.16, 0.42], accent: "#76007D" },
  { id: "method",   range: [0.40, 0.60], clip: [0.42, 0.62], accent: "#1E94A5" },
  { id: "process",  range: [0.60, 0.82], clip: [0.62, 0.86], accent: "#2AAF7F" },
  { id: "activate", range: [0.82, 1.00], clip: [0.86, 1.00], accent: "#2AAF7F" },
]

// Desktop panels + mobile per-beat cards (m-*). exitAt 1.05 = stays until unpin.
// A beat's panels arrive together (tight 0.005 stagger) and hold until the beat ends, so text stays readable.
export const PANELS: PanelSpec[] = [
  { id: "wake-headline",  enterAt: 0.00,  exitAt: 0.17 },
  { id: "pains-title",    enterAt: 0.18,  exitAt: 0.39 },
  { id: "pains-1",        enterAt: 0.185, exitAt: 0.39 },
  { id: "pains-2",        enterAt: 0.19,  exitAt: 0.39 },
  { id: "pains-3",        enterAt: 0.195, exitAt: 0.39 },
  { id: "method-title",   enterAt: 0.40,  exitAt: 0.59 },
  { id: "method-1",       enterAt: 0.405, exitAt: 0.59 },
  { id: "method-2",       enterAt: 0.41,  exitAt: 0.59 },
  { id: "method-3",       enterAt: 0.415, exitAt: 0.59 },
  { id: "method-4",       enterAt: 0.42,  exitAt: 0.59 },
  { id: "process-title",  enterAt: 0.60,  exitAt: 0.81 },
  { id: "process-1",      enterAt: 0.605, exitAt: 0.81 },
  { id: "process-2",      enterAt: 0.61,  exitAt: 0.81 },
  { id: "process-3",      enterAt: 0.615, exitAt: 0.81 },
  { id: "process-4",      enterAt: 0.62,  exitAt: 0.81 },
  { id: "activate-cta",   enterAt: 0.82,  exitAt: 1.05 },
  { id: "m-wake",     enterAt: 0.00, exitAt: 0.17 },
  { id: "m-pains",    enterAt: 0.18, exitAt: 0.39 },
  { id: "m-method",   enterAt: 0.40, exitAt: 0.59 },
  { id: "m-process",  enterAt: 0.60, exitAt: 0.81 },
  { id: "m-activate", enterAt: 0.82, exitAt: 1.05 },
]

/** Fade width, in stage-progress units, at each end of a panel window. */
export const PANEL_FADE = 0.025
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
  // Panels whose window starts at the very top of the stage are fully
  // visible at p=0 (no fade-in) — the hero headline must not start hidden.
  const rise = spec.enterAt <= 0 ? 1 : smoothstep((p - spec.enterAt) / PANEL_FADE)
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
