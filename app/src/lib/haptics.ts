/* ═══════════════════════════════════════════════════════════════
   one haptic voice — five named verbs instead of scattered numbers.
   Android speaks through the motor; iOS (where vibrate is a no-op)
   answers with a brief gold rim-flash on the touched element, so
   nothing ever feels dead under her finger.
   ═══════════════════════════════════════════════════════════════ */
import { reduced, vibrate } from './prefs'

const canBuzz =
  typeof navigator !== 'undefined' && 'vibrate' in navigator

function flash(el?: Element | null) {
  if (reduced || canBuzz || !el || !(el instanceof HTMLElement)) return
  el.classList.remove('hx-flash')
  void el.offsetWidth
  el.classList.add('hx-flash')
  setTimeout(() => el.classList.remove('hx-flash'), 260)
}

/** the faintest acknowledgement — a grain under the thumb */
export function tick(el?: Element | null) { vibrate(3); flash(el) }
/** something small happened — a star left, a flap lifted */
export function soft(el?: Element | null) { vibrate(6); flash(el) }
/** something completed — a promise sworn, a card next */
export function confirm(el?: Element | null) { vibrate(10); flash(el) }
/** something broke open — wax, seals, envelopes */
export function seal(el?: Element | null) { vibrate([14, 30, 14]); flash(el) }
/** something royal concluded — coronation, delivery, the meter */
export function fanfare(el?: Element | null) { vibrate([40, 70, 40]); flash(el) }
