/* ═══════════════════════════════════════════════════════════════
   her echoes · motion language
   ONE hand animates this whole page. Every animation in the app
   picks from these tokens — never invent ad-hoc eases or durations.

   Feel: royal, unhurried, precise. Things *arrive*, they don't pop.

   Depth model (three layers, three speeds):
     background  — the living sky (WebGL / CSS), slowest, breathes
     midground   — her words, normal scroll, choreographed by ScrollTrigger
     foreground  — dust motes + film grain + cursor star, subtle counter-drift

   Narrative device: the sky itself deepens from dusk to true night
   as she scrolls from "once upon a time" to the letter (uDeep 0→1).
   ═══════════════════════════════════════════════════════════════ */

export const EASE = {
  /** standard entrances — text, cards, blocks */
  enter: 'power3.out',
  /** grand reveals — the letter, the decree, coronation */
  grand: 'expo.out',
  /** camera moves, scroll-to, positional shifts */
  move: 'power2.inOut',
  /** stroke / handwriting draws */
  draw: 'power1.inOut',
  /** needle overshoot, playful physical snaps */
  spring: 'back.out(1.7)',
  /** anything tied to scroll position */
  scrub: 'none',
} as const

export const DUR = {
  /** taps, toggles, hovers */
  micro: 0.35,
  /** standard entrance */
  ui: 0.75,
  /** scene-level moves (camera, cover) */
  scene: 1.2,
  /** grand, once-per-visit moments */
  grand: 1.9,
} as const

export const STAG = {
  tight: 0.05,
  list: 0.09,
  lines: 0.14,
} as const

/** Motion (framer) spring presets — the physical counterpart of EASE */
export const SPRING = {
  /** button / tile presses */
  press: { type: 'spring' as const, stiffness: 420, damping: 26 },
  /** cards expanding into overlays */
  card: { type: 'spring' as const, stiffness: 180, damping: 24 },
  /** heavy, sentimental objects (jar stars, letter) */
  soft: { type: 'spring' as const, stiffness: 120, damping: 19 },
}

/** CSS counterpart of EASE.enter — for transitions in global.css */
export const CSS_EASE = 'cubic-bezier(.22,.7,.2,1)'
