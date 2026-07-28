/* shared device-tilt state for the sky parallax */
export const tilt = { x: 0, y: 0, on: false }

function enableGyro() {
  const DME = (window as Window & {
    DeviceOrientationEvent?: { requestPermission?: () => Promise<string> }
  }).DeviceOrientationEvent
  const attach = () => {
    addEventListener('deviceorientation', (e) => {
      if (e.beta == null || e.gamma == null) return
      tilt.on = true
      // gentle: map ±30° of tilt to ±1
      tilt.x = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 30))
      tilt.y = Math.max(-1, Math.min(1, ((e.beta ?? 45) - 45) / 30))
    }, { passive: true })
  }
  try {
    if (DME?.requestPermission) {
      DME.requestPermission().then((r) => { if (r === 'granted') attach() }).catch(() => {})
    } else attach()
  } catch { /* no gyro — the stars drift on their own */ }
}

let armed = false
/** call from any user gesture (iOS requires one before granting motion) */
export function armGyroOnGesture() {
  if (armed) return
  armed = true
  enableGyro()
}
