/* ═══════════════════════════════════════════════════════════════
   the kingdom's voice — one Web Audio graph, three buses.

   music  — her songs, self-hosted files through a GainNode
            (iOS ignores element.volume; the gain node is the law)
            with a low-pass "hush" while letters are being read
   sfx    — every small sound is SYNTHESIZED here: chimes, thumps,
            wax rasp, quill scritch. zero asset bytes, zero network.
   master — one gold bell silences the small sounds forever;
            her chosen music is never gated by it.

   Nothing constructs until her first gesture (iOS unlock), and
   nothing here is ever load-bearing — every call fails silently.
   ═══════════════════════════════════════════════════════════════ */
import { reduced, tier } from './prefs'
import { keepsake, patch } from './keepsake'

let ctx: AudioContext | null = null
let musicGain: GainNode | null = null
let musicFilter: BiquadFilterNode | null = null
let sfxGain: GainNode | null = null
let noiseBuf: AudioBuffer | null = null

/** the small sounds — on by default for full/mid, off for lite/reduced */
export function sfxOn(): boolean {
  const saved = keepsake().sound
  if (saved !== null) return saved
  return !reduced && tier !== 'lite'
}
export function setSfx(on: boolean) {
  patch({ sound: on })
  if (sfxGain && ctx) sfxGain.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.08)
}

/** create/resume the graph — MUST be called from a user gesture */
export function unlock() {
  try {
    if (!ctx) {
      const AC = window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      ctx = new AC()
      musicFilter = ctx.createBiquadFilter()
      musicFilter.type = 'lowpass'
      musicFilter.frequency.value = 18000
      musicGain = ctx.createGain()
      musicGain.gain.value = 0.0001 /* songs fade in from silence */
      musicGain.connect(musicFilter).connect(ctx.destination)
      sfxGain = ctx.createGain()
      sfxGain.gain.value = sfxOn() ? 1 : 0
      sfxGain.connect(ctx.destination)
      /* one second of white noise — the raw cloth every rasp is cut from */
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
      const d = noiseBuf.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  } catch { /* no audio — the tale stays silent, never broken */ }
}

export function musicNode(el: HTMLAudioElement): boolean {
  try {
    if (!ctx || !musicGain) return false
    ctx.createMediaElementSource(el).connect(musicGain)
    return true
  } catch { return false }
}

/* the music level is baseLevel × duckFactor — fades set the base,
   the hush multiplies it, and neither can clobber the other */
let baseLevel = 0
let ducks = 0
function applyMusic(seconds: number) {
  if (!ctx || !musicGain) return
  const v = baseLevel * (ducks > 0 ? 0.45 : 1)
  musicGain.gain.setTargetAtTime(Math.max(0.0001, v), ctx.currentTime, seconds / 3)
}

/** ramp the music level (used for fades — element.volume is a no-op on iOS) */
export function musicLevel(v: number, seconds = 0.8) {
  baseLevel = v
  applyMusic(seconds)
}

/* ── the hush — music recedes behind a closed door while she reads ── */
export function duck() {
  ducks++
  if (ducks !== 1 || !ctx || !musicFilter) return
  musicFilter.frequency.setTargetAtTime(900, ctx.currentTime, 0.2)
  applyMusic(0.6)
}
export function unduck() {
  ducks = Math.max(0, ducks - 1)
  if (ducks !== 0 || !ctx || !musicFilter) return
  musicFilter.frequency.setTargetAtTime(18000, ctx.currentTime, 0.4)
  applyMusic(1.2)
}

/* ─────────────────── synthesized small sounds ─────────────────── */

function env(g: GainNode, t: number, peak: number, decay: number, attack = 0.004) {
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
}

/** a music-box chime · semitones above A5, so melodies cost nothing */
export function chime(semitones = 0, gain = 0.1) {
  if (!ctx || !sfxGain || !sfxOn()) return
  const t = ctx.currentTime
  const f = 880 * Math.pow(2, semitones / 12)
  for (const [mult, amt] of [[1, 1], [2.01, 0.32]] as const) {
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.value = f * mult
    const g = ctx.createGain()
    env(g, t, gain * amt, 1.1)
    o.connect(g).connect(sfxGain)
    o.start(t); o.stop(t + 1.3)
  }
}

/** a soft heart thump — felt more than heard */
export function thump(gain = 0.12) {
  if (!ctx || !sfxGain || !sfxOn()) return
  const t = ctx.currentTime
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(95, t)
  o.frequency.exponentialRampToValueAtTime(42, t + 0.16)
  const g = ctx.createGain()
  env(g, t, gain, 0.22, 0.008)
  o.connect(g).connect(sfxGain)
  o.start(t); o.stop(t + 0.3)
}

/** wax cracking / seals breaking — a dry snap with a low knuckle */
export function crack(gain = 0.16) {
  if (!ctx || !sfxGain || !noiseBuf || !sfxOn()) return
  const t = ctx.currentTime
  const s = ctx.createBufferSource()
  s.buffer = noiseBuf
  const f = ctx.createBiquadFilter()
  f.type = 'highpass'; f.frequency.value = 1800
  const g = ctx.createGain()
  env(g, t, gain, 0.09, 0.001)
  s.connect(f).connect(g).connect(sfxGain)
  s.start(t, Math.random() * 0.4, 0.12)
  thump(gain * 0.5)
}

/** the GRANTED stamp / needle stop — a padded thunk */
export function thunk(gain = 0.14) {
  if (!ctx || !sfxGain || !noiseBuf || !sfxOn()) return
  const t = ctx.currentTime
  const s = ctx.createBufferSource()
  s.buffer = noiseBuf
  const f = ctx.createBiquadFilter()
  f.type = 'lowpass'; f.frequency.value = 500
  const g = ctx.createGain()
  env(g, t, gain, 0.12, 0.002)
  s.connect(f).connect(g).connect(sfxGain)
  s.start(t, Math.random() * 0.4, 0.1)
  thump(gain * 0.6)
}

/** one warm chord bloom — the book opening gains a breath of sound */
export function bloom(gain = 0.05) {
  if (!ctx || !sfxGain || !sfxOn()) return
  const t = ctx.currentTime
  for (const [st, dl] of [[0, 0], [4, 0.09], [7, 0.18], [12, 0.3]] as const) {
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = 440 * Math.pow(2, st / 12)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t + dl)
    g.gain.linearRampToValueAtTime(gain, t + dl + 0.4)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dl + 2.6)
    o.connect(g).connect(sfxGain)
    o.start(t + dl); o.stop(t + dl + 2.8)
  }
}

/* continuous textures — the quill and the wax, gain-driven, never allocated per event */
interface Texture { src: AudioBufferSourceNode; g: GainNode }
function startTexture(filterType: BiquadFilterType, freq: number, rate: number): Texture | null {
  if (!ctx || !sfxGain || !noiseBuf || !sfxOn()) return null
  const src = ctx.createBufferSource()
  src.buffer = noiseBuf; src.loop = true
  src.playbackRate.value = rate
  const f = ctx.createBiquadFilter()
  f.type = filterType; f.frequency.value = freq
  const g = ctx.createGain()
  g.gain.value = 0
  src.connect(f).connect(g).connect(sfxGain)
  src.start()
  return { src, g }
}

let quill: Texture | null = null
/** the nib touches paper (called while the marquee ink writes) */
export function quillOn() {
  if (!ctx) return
  if (!quill) quill = startTexture('bandpass', 3400, 0.92 + Math.random() * 0.16)
  quill?.g.gain.setTargetAtTime(0.028, ctx.currentTime, 0.05)
}
export function quillOff() {
  if (!ctx || !quill) return
  quill.g.gain.setTargetAtTime(0, ctx.currentTime, 0.08)
}

let wax: Texture | null = null
/** dry wax rasp under her thumb — gain follows finger speed (0..1) */
export function waxRasp(speed: number) {
  if (!ctx) return
  if (!wax) wax = startTexture('bandpass', 1300, 1)
  if (!wax) return
  wax.src.playbackRate.value = 0.9 + speed * 0.5
  wax.g.gain.setTargetAtTime(Math.min(0.05, speed * 0.06), ctx.currentTime, 0.05)
}
export function waxQuiet() {
  if (!ctx || !wax) return
  wax.g.gain.setTargetAtTime(0, ctx.currentTime, 0.09)
}
