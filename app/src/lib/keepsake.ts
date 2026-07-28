/* ═══════════════════════════════════════════════════════════════
   the keepsake ledger — the kingdom remembers her.
   One versioned localStorage record; components read on mount and
   mark on interaction. Never required for anything to work: every
   read falls back to a fresh ledger, every write fails silently.
   ═══════════════════════════════════════════════════════════════ */

export interface Ledger {
  v: 1
  /** number of times the book has been opened (bumped once per session) */
  visits: number
  firstSeen: string
  lastSeen: string
  /** indices of truths whose evidence she has read */
  truths: number[]
  /** indices of confession envelopes she has unsealed */
  confessions: number[]
  /** the decree's wax — date string once broken */
  sealBroken: string | null
  /** stars she has set free from the jar (lifetime count) */
  freedStars: number
  /** she has held the heart and read the letter */
  letterRead: boolean
  /** master toggle for the small sounds (null = tier default) */
  sound: boolean | null
  /** music player bookmark */
  player: { idx: number; pos: number }
  /** per-day flags (7:02 slip etc.) — keyed by YYYY-MM-DD */
  dayFlags: Record<string, true>
}

const KEY = 'her-echoes:v1'

function fresh(): Ledger {
  const now = new Date().toISOString()
  return {
    v: 1, visits: 0, firstSeen: now, lastSeen: now,
    truths: [], confessions: [], sealBroken: null,
    freedStars: 0, letterRead: false, sound: null,
    player: { idx: 0, pos: 0 }, dayFlags: {},
  }
}

let ledger: Ledger = fresh()
try {
  const raw = localStorage.getItem(KEY)
  if (raw) {
    const parsed = JSON.parse(raw) as Partial<Ledger>
    if (parsed && parsed.v === 1) ledger = { ...fresh(), ...parsed }
  }
} catch { /* private mode, blocked storage — the book simply forgets */ }

let timer: ReturnType<typeof setTimeout> | null = null
function save() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(ledger)) } catch { /* fine */ }
  }, 180)
}

export function keepsake(): Ledger { return ledger }

export function patch(p: Partial<Ledger>) {
  ledger = { ...ledger, ...p }
  save()
}

/** add a number to one of the index lists, once */
export function markIndex(list: 'truths' | 'confessions', i: number) {
  if (ledger[list].includes(i)) return
  ledger[list] = [...ledger[list], i]
  save()
}

/** days she has been away before this visit (0 on first ever visit) */
export function daysAway(): number {
  const last = Date.parse(ledger.lastSeen)
  if (!isFinite(last)) return 0
  return Math.max(0, Math.floor((Date.now() - last) / 86400000))
}

/** one-shot per-day flag — returns true the first time only */
export function onceToday(flag: string, ymd: string): boolean {
  const k = flag + ':' + ymd
  if (ledger.dayFlags[k]) return false
  /* keep the flag map small — only today's entries matter */
  const kept: Record<string, true> = { [k]: true }
  for (const key of Object.keys(ledger.dayFlags)) if (key.endsWith(ymd)) kept[key] = true
  ledger.dayFlags = kept
  save()
  return true
}

/** call once at startup — bumps the visit count, remembers the parting */
export function openVisit(): { visits: number; away: number } {
  const away = daysAway()
  ledger.visits += 1
  ledger.lastSeen = new Date().toISOString()
  save()
  addEventListener('pagehide', () => {
    ledger.lastSeen = new Date().toISOString()
    try { localStorage.setItem(KEY, JSON.stringify(ledger)) } catch { /* fine */ }
  })
  return { visits: ledger.visits, away }
}
