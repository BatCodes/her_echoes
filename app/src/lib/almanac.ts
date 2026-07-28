/* ═══════════════════════════════════════════════════════════════
   the royal almanac — the site knows what day it is for HER.
   Everything is computed in Asia/Karachi: the day count flips at
   her midnight, the late-night hush follows her clock, and the
   7:02 minute is the minute she said Yes, in her timezone.
   ═══════════════════════════════════════════════════════════════ */
import { DAY_ONE } from '../content'

export const HER_TZ = 'Asia/Karachi'
export const HIS_TZ = 'Europe/Madrid'

interface HerClock { y: number; m: number; d: number; hh: number; mm: number; ymd: string }

export function herClock(date = new Date()): HerClock {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: HER_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date)
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0)
  const y = get('year'), m = get('month'), d = get('day')
  return {
    y, m, d, hh: get('hour') % 24, mm: get('minute'),
    ymd: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
  }
}

/** day N of forever — calendar days since day one, in her timezone (day one = day 1) */
export function dayOfForever(date = new Date()): number {
  const c = herClock(date)
  const today = Date.UTC(c.y, c.m - 1, c.d)
  const [y0, m0, d0] = DAY_ONE.split('-').map(Number)
  const start = Date.UTC(y0, m0 - 1, d0)
  return Math.max(1, Math.round((today - start) / 86400000) + 1)
}

export type Occasion = 'dayone' | 'iloveyou' | 'ring' | 'birthday' | null

/** which page of the almanac is today? */
export function occasion(date = new Date()): Occasion {
  const c = herClock(date)
  if (c.d === 26 && c.m === 1) return 'dayone'
  if (c.d === 13 && c.m === 2) return 'iloveyou'
  if (c.d === 15 && c.m === 2) return 'ring'
  if (c.d === 14 && c.m === 6) return 'birthday'
  return null
}

/** day one was a 26th — every monthly 26th gets a quiet nod */
export function isMonthly26(date = new Date()): boolean {
  return herClock(date).d === 26
}

/** 23:00–04:59 her time — the kingdom lowers its voice */
export function isHerLateNight(date = new Date()): boolean {
  const { hh } = herClock(date)
  return hh >= 23 || hh < 5
}

/** the exact minute she said Yes to "May I call?" — 7:02 pm her time */
export function isSevenOhTwo(date = new Date()): boolean {
  const { hh, mm } = herClock(date)
  return hh === 19 && mm === 2
}

const timeFmt = (tz: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false })

/** the two kingdoms' clocks, side by side */
export function twoClocks(date = new Date()): { hers: string; his: string } {
  return { hers: timeFmt(HER_TZ).format(date), his: timeFmt(HIS_TZ).format(date) }
}
