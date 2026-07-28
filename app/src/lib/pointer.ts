/* window-level pointer state for the sky parallax.
   (the WebGL canvas is pointer-events:none, so R3F's own pointer
   tracking never fires — this module listens on the window instead) */

export const pointerState = { x: 0, y: 0 }

if (typeof window !== 'undefined') {
  addEventListener('pointermove', (e) => {
    pointerState.x = (e.clientX / innerWidth) * 2 - 1
    pointerState.y = -((e.clientY / innerHeight) * 2 - 1)
  }, { passive: true })
}
