/* shared state bridging the DOM world and the WebGL sky
   (same module-object pattern as scrollState — cheap, no re-renders) */

export const skyState = {
  /** she touched the cover — camera pushes through into the hero */
  open: false,
  /** ms timestamp of the push, for anything that wants to sync */
  openedAt: 0,

  /* ── the journey ── */
  /** where the camera is travelling to — chapters step it deeper */
  zTarget: 14,
  /** dust weather: per-chapter tint + drift multiplier */
  weather: { r: 0.93, g: 0.75, b: 0.48, drift: 1 },

  /* ── her touch, handed to the shaders ── */
  /** finale inhale — the dust gathers toward her held thumb (client px) */
  inhale: { on: false, x: 0, y: 0, amt: 0 },
  /** one-shot bursts (exhales) at emotional peaks (client px + start ms) */
  bursts: [] as { x: number; y: number; t: number }[],
  /** comets fall generously until this timestamp (performance.now ms) */
  showerUntil: 0,
  /** wish stars — freed jar memories waiting to join the sky (client px) */
  wishes: [] as { x: number; y: number }[],
  /** the epilogue is on screen — two stars, side by side, ignite */
  epilogue: false,
}

export function markSkyOpen() {
  if (skyState.open) return
  skyState.open = true
  skyState.openedAt = performance.now()
}

/* ── skyFx — one-line calls for the DOM side ── */

/** the night gasps outward from a point (meter slam, stamp, seal) */
export function exhaleAt(x: number, y: number) {
  const now = performance.now()
  skyState.bursts = [...skyState.bursts.filter((b) => now - b.t < 2000).slice(-2), { x, y, t: now }]
}

/** a freed memory rises and becomes a permanent star */
export function wishStar(x: number, y: number) {
  if (skyState.wishes.length < 24) skyState.wishes.push({ x, y })
}

/** the sky quietly applauds — comets fall freely for a while */
export function meteorShower(ms = 8000) {
  skyState.showerUntil = performance.now() + ms
}

/** per-chapter dust weather */
export function setWeather(hex: string, drift = 1) {
  const n = parseInt(hex.replace('#', ''), 16)
  skyState.weather = {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
    drift,
  }
}
