/* device + motion preferences, decided once at startup */
export const reduced =
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches

function detectWebGL2(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!c.getContext('webgl2')
  } catch {
    return false
  }
}
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

const coarse =
  typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

/**
 * three device tiers — the invisible half of "visual quality":
 *   'full' — WebGL sky + bloom/grain post + physics (desktop, strong phones)
 *   'mid'  — WebGL sky, no post-processing, physics on (most phones)
 *   'lite' — CSS sky + transitions only (reduced-motion, weak/saving devices)
 */
export const tier: 'full' | 'mid' | 'lite' = (() => {
  if (
    reduced ||
    typeof document === 'undefined' ||
    !detectWebGL() ||
    (nav?.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
    nav?.connection?.saveData
  ) return 'lite'
  const mem = nav?.deviceMemory
  const cores = navigator.hardwareConcurrency || 4
  if (!detectWebGL2()) return 'mid'
  if (!coarse) return 'full'                    // desktops with WebGL2
  if ((mem === undefined || mem >= 6) && cores >= 6) return 'full'
  return 'mid'
})()

export function vibrate(pattern: number | number[]) {
  try {
    if (!reduced && 'vibrate' in navigator) navigator.vibrate(pattern)
  } catch { /* not supported — fine */ }
}
