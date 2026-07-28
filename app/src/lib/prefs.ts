/* device + motion preferences, decided once at startup */
export const reduced =
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches

function detectWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

const nav = typeof navigator !== 'undefined'
  ? (navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } })
  : undefined

/** 'full' = WebGL sky + physics · 'lite' = CSS sky, no physics */
export const tier: 'full' | 'lite' =
  !reduced &&
  typeof document !== 'undefined' &&
  detectWebGL() &&
  (nav?.deviceMemory === undefined || nav.deviceMemory > 2) &&
  !nav?.connection?.saveData
    ? 'full'
    : 'lite'

export function vibrate(pattern: number | number[]) {
  try {
    if (!reduced && 'vibrate' in navigator) navigator.vibrate(pattern)
  } catch { /* not supported — fine */ }
}
