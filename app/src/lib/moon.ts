/* the real moon — no API, no network: synodic arithmetic from a
   known new-moon epoch. Good to within a few hours for decades,
   which is all a love story needs. */

const SYNODIC = 29.53058867 // days
const EPOCH = Date.UTC(2000, 0, 6, 18, 14) // known new moon

export interface MoonState {
  /** 0 = new · 0.5 = full · 1 = new again */
  phase: number
  /** lit fraction 0..1 */
  illum: number
  waxing: boolean
}

export function moonNow(date = new Date()): MoonState {
  const days = (date.getTime() - EPOCH) / 86400000
  const phase = ((days % SYNODIC) + SYNODIC) % SYNODIC / SYNODIC
  return {
    phase,
    illum: (1 - Math.cos(2 * Math.PI * phase)) / 2,
    waxing: phase < 0.5,
  }
}

/** chaudhvin ka chand — is tonight the night the month waits for? */
export function isFullMoon(date = new Date()): boolean {
  return moonNow(date).illum > 0.965
}
