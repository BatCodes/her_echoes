/* shared state bridging the DOM world and the WebGL sky
   (same module-object pattern as scrollState — cheap, no re-renders) */

export const skyState = {
  /** she touched the cover — camera pushes through into the hero */
  open: false,
  /** ms timestamp of the push, for anything that wants to sync */
  openedAt: 0,
}

export function markSkyOpen() {
  if (skyState.open) return
  skyState.open = true
  skyState.openedAt = performance.now()
}
