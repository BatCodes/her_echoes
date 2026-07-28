import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing'
import * as THREE from 'three'
import { gsap } from '../lib/gsapSetup'
import { scrollState } from '../lib/scroll'
import { tilt } from '../lib/gyro'
import { pointerState } from '../lib/pointer'
import { skyState } from '../lib/skyState'
import { reduced } from '../lib/prefs'

/* ═══════════════════════════════════════════════════════════════
   The living sky — the emotional backbone of the whole page.

   · nebula: fbm fragment shader, deepens dusk → true night with scroll
   · stars: three depth layers + a handful of HDR "hero" stars whose
     gold actually blooms (full tier) instead of just being drawn brighter
   · condensation: stars drift in from scatter as the cover appears
   · comets: tapered ribbon trails, not two-point lines
   · parallax: pointer (desktop), gyroscope (mobile), scroll drift
   · camera: pushes through the starfield when she opens the book
   · discipline: DPR ≤ 2, pauses off-tab, no per-frame allocations
   ═══════════════════════════════════════════════════════════════ */

/* ---------- shared uniforms (single write per frame) ---------- */
function useSharedUniforms() {
  return useMemo(() => ({
    uTime: { value: 0 },
    uDeep: { value: 0 },
    uForm: { value: reduced ? 1 : 0 },
  }), [])
}
type Shared = ReturnType<typeof useSharedUniforms>

/* ------------------------- nebula ------------------------- */
const NEB_FRAG = `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uDeep;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.,0.)), u.x),
               mix(hash(i + vec2(0.,1.)), hash(i + vec2(1.,1.)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.7; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(2.4, 1.4);
    float t = uTime * 0.012;

    /* palette — dusk indigo drifting to deep ink as she reads */
    vec3 duskTop   = vec3(0.086, 0.070, 0.200);
    vec3 duskBot   = vec3(0.137, 0.102, 0.300);
    vec3 nightTop  = vec3(0.024, 0.018, 0.078);
    vec3 nightBot  = vec3(0.055, 0.043, 0.130);
    vec3 top = mix(duskTop, nightTop, uDeep);
    vec3 bot = mix(duskBot, nightBot, uDeep);
    vec3 col = mix(bot, top, smoothstep(0.0, 1.0, uv.y));

    /* two slow nebula fields: indigo mist + a faint warm memory of gold */
    float n1 = fbm(p * 1.7 + vec2(t, -t * 0.6));
    float n2 = fbm(p * 3.1 - vec2(t * 0.7, t * 0.4) + 4.2);
    vec3 mist  = vec3(0.30, 0.24, 0.55);
    vec3 warm  = vec3(0.93, 0.75, 0.48);
    vec3 blush = vec3(0.95, 0.66, 0.71);
    col += mist  * smoothstep(0.52, 0.95, n1) * (0.16 - 0.06 * uDeep);
    col += warm  * smoothstep(0.62, 0.98, n2) * (0.075 - 0.035 * uDeep);
    col += blush * smoothstep(0.70, 1.0, fbm(p * 2.2 + 9.1 + vec2(-t, t))) * 0.045;

    /* soft vignette + horizon glow that dies as night deepens */
    float vig = smoothstep(1.25, 0.35, length((uv - 0.5) * vec2(1.7, 1.25)));
    col *= 0.72 + 0.28 * vig;
    col += warm * (1.0 - smoothstep(0.0, 0.38, uv.y)) * (0.05 * (1.0 - uDeep));

    /* dithering against banding */
    col += (hash(uv * 913.7 + uTime) - 0.5) * 0.012;
    gl_FragColor = vec4(col, 1.0);
  }
`
function Nebula({ shared }: { shared: Shared }) {
  const uniforms = useMemo(() => ({ uTime: shared.uTime, uDeep: shared.uDeep }), [shared])
  return (
    <mesh position={[0, 0, -70]} renderOrder={-10} frustumCulled={false}>
      <planeGeometry args={[420, 230]} />
      <shaderMaterial
        vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
        fragmentShader={NEB_FRAG}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}

/* ------------------------- stars ------------------------- */
const STAR_VERT = `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  attribute vec3 aScatter;
  uniform float uTime;
  uniform float uPix;
  uniform float uForm;
  varying vec3 vColor;
  varying float vTw;
  void main() {
    vColor = aColor;
    vTw = 0.62 + 0.38 * sin(uTime * (0.55 + fract(aSeed) * 1.35) + aSeed * 6.283);
    float f = 1.0 - pow(1.0 - uForm, 3.0);        /* ease the condensation */
    vec3 pos = mix(aScatter, position, f);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uPix * (150.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const STAR_FRAG = `
  precision mediump float;
  varying vec3 vColor;
  varying float vTw;
  uniform float uDeep;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float core = smoothstep(0.5, 0.0, d);
    float a = core * core * vTw * (0.82 + 0.3 * uDeep);
    if (a < 0.02) discard;
    gl_FragColor = vec4(vColor, a);
  }
`
/* hero stars: 4-point flare, HDR gold — these are what blooms */
const FLARE_FRAG = `
  precision mediump float;
  varying vec3 vColor;
  varying float vTw;
  uniform float uDeep;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float core = smoothstep(0.30, 0.0, d);
    float fl = pow(max(0.0, 1.0 - abs(uv.x) * 5.0), 4.0)
             + pow(max(0.0, 1.0 - abs(uv.y) * 5.0), 4.0);
    fl *= smoothstep(0.5, 0.05, d) * 0.6;
    float a = (core + fl) * (0.55 + 0.45 * vTw) * (0.85 + 0.25 * uDeep);
    if (a < 0.02) discard;
    gl_FragColor = vec4(vColor, a);
  }
`

const PALETTE = [
  new THREE.Color('#f7e3bf'), new THREE.Color('#eec07a'),
  new THREE.Color('#f2a9b4'), new THREE.Color('#c3bce0'), new THREE.Color('#ffffff'),
]
const HERO_PALETTE = [new THREE.Color('#ffd9a0'), new THREE.Color('#fff3e8'), new THREE.Color('#ffc2cc')]

function StarLayer({ shared, count, spread, z, size, drift, flare = false, boost = 1 }: {
  shared: Shared
  count: number; spread: number; z: number; size: number; drift: number
  flare?: boolean; boost?: number
}) {
  const group = useRef<THREE.Points>(null)
  const { gl } = useThree()

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const scat = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const seeds = new Float32Array(count)
    const cols = new Float32Array(count * 3)
    const pal = flare ? HERO_PALETTE : PALETTE
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * spread
      const y = (Math.random() - 0.5) * spread * 0.72
      const zz = z + (Math.random() - 0.5) * 4
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = zz
      /* condensation origin: same direction, flung outward */
      const m = 1.6 + Math.random() * 1.4
      scat[i * 3] = x * m + (Math.random() - 0.5) * 24
      scat[i * 3 + 1] = y * m + (Math.random() - 0.5) * 18
      scat[i * 3 + 2] = zz - 14 - Math.random() * 22
      sizes[i] = size * (0.5 + Math.random())
      seeds[i] = Math.random() * 100
      const c = pal[Math.floor(Math.random() * pal.length)]
      cols[i * 3] = c.r * boost; cols[i * 3 + 1] = c.g * boost; cols[i * 3 + 2] = c.b * boost
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aScatter', new THREE.BufferAttribute(scat, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    g.setAttribute('aColor', new THREE.BufferAttribute(cols, 3))
    return g
  }, [count, spread, z, size, flare, boost])
  useEffect(() => () => { geo.dispose() }, [geo])

  const uniforms = useMemo(() => ({
    uTime: shared.uTime,
    uDeep: shared.uDeep,
    uForm: shared.uForm,
    uPix: { value: Math.min(gl.getPixelRatio(), 2) },
  }), [gl, shared])

  useFrame(() => {
    const g = group.current
    if (!g) return
    const px = tilt.on ? tilt.x : pointerState.x
    const py = tilt.on ? tilt.y : pointerState.y
    // parallax: nearer layers move more; scroll drifts the sky upward
    g.position.x += ((px * drift) - g.position.x) * 0.04
    g.position.y += ((-py * drift * 0.6 + scrollState.progress * drift * 3.4) - g.position.y) * 0.04
  })

  return (
    <points ref={group} geometry={geo} frustumCulled={false}>
      <shaderMaterial
        vertexShader={STAR_VERT}
        fragmentShader={flare ? FLARE_FRAG : STAR_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ------------------------- comets ------------------------- */
const TRAIL = 26

function Comet({ boost }: { boost: number }) {
  const mesh = useRef<THREE.Mesh>(null)
  const st = useRef({
    phase: 'wait' as 'wait' | 'fly',
    until: 2 + Math.random() * 9,
    t: 0, life: 2,
    x: 0, y: 0, vx: 0, vy: 0,
    hist: new Float32Array(TRAIL * 2),
    n: 0,
  })

  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const positions = new Float32Array(TRAIL * 2 * 3)
    const aT = new Float32Array(TRAIL * 2)
    const index: number[] = []
    for (let i = 0; i < TRAIL; i++) {
      aT[i * 2] = aT[i * 2 + 1] = i / (TRAIL - 1)
      if (i < TRAIL - 1) {
        const k = i * 2
        index.push(k, k + 1, k + 2, k + 1, k + 3, k + 2)
      }
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aT', new THREE.BufferAttribute(aT, 1))
    g.setIndex(index)
    const m = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float aT;
        varying float vT;
        void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: `
        precision mediump float;
        varying float vT;
        uniform float uEnv;
        uniform float uBoost;
        void main(){
          float a = pow(1.0 - vT, 1.8) * uEnv;
          if (a < 0.015) discard;
          vec3 head = vec3(1.0, 0.95, 0.82) * uBoost;
          vec3 tail = vec3(0.93, 0.75, 0.48);
          gl_FragColor = vec4(mix(head, tail, vT), a);
        }
      `,
      uniforms: { uEnv: { value: 0 }, uBoost: { value: boost } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    return { geo: g, mat: m }
  }, [boost])
  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  useFrame((_, dtRaw) => {
    const dt = Math.min(0.05, dtRaw)
    const s = st.current
    if (s.phase === 'wait') {
      s.until -= dt
      mat.uniforms.uEnv.value = 0
      if (s.until <= 0) {
        s.phase = 'fly'
        s.t = 0
        s.life = 1.6 + Math.random() * 0.7
        s.x = (Math.random() - 0.5) * 44
        s.y = 9 + Math.random() * 8
        const ang = Math.PI * (Math.random() < 0.5 ? 1.12 + Math.random() * 0.18 : -0.12 - Math.random() * 0.18)
        const sp = 17 + Math.random() * 9
        s.vx = Math.cos(ang) * sp
        s.vy = -Math.abs(Math.sin(ang)) * sp * 0.62 - 4
        s.hist.fill(0)
        for (let i = 0; i < TRAIL; i++) { s.hist[i * 2] = s.x; s.hist[i * 2 + 1] = s.y }
      }
      return
    }
    s.t += dt
    s.x += s.vx * dt
    s.y += s.vy * dt
    /* shift history — newest at index 0 */
    for (let i = TRAIL - 1; i > 0; i--) {
      s.hist[i * 2] = s.hist[(i - 1) * 2]
      s.hist[i * 2 + 1] = s.hist[(i - 1) * 2 + 1]
    }
    s.hist[0] = s.x; s.hist[1] = s.y

    const frac = s.t / s.life
    mat.uniforms.uEnv.value = Math.sin(Math.PI * Math.min(1, frac)) * 0.85
    if (frac >= 1.15) { s.phase = 'wait'; s.until = 6 + Math.random() * 9 }

    /* rebuild the ribbon */
    const attr = geo.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    for (let i = 0; i < TRAIL; i++) {
      const hx = s.hist[i * 2], hy = s.hist[i * 2 + 1]
      const px = i < TRAIL - 1 ? s.hist[(i + 1) * 2] : hx
      const py = i < TRAIL - 1 ? s.hist[(i + 1) * 2 + 1] : hy
      let dx = hx - px, dy = hy - py
      const len = Math.hypot(dx, dy) || 1
      dx /= len; dy /= len
      const w = 0.30 * (1 - i / (TRAIL - 1)) + 0.02
      const k = i * 6
      arr[k] = hx - dy * w; arr[k + 1] = hy + dx * w; arr[k + 2] = -12
      arr[k + 3] = hx + dy * w; arr[k + 4] = hy - dx * w; arr[k + 5] = -12
    }
    attr.needsUpdate = true
  })

  return <mesh ref={mesh} geometry={geo} material={mat} frustumCulled={false} />
}

/* --------------------- camera + uniforms rig --------------------- */
function Rig({ shared }: { shared: Shared }) {
  const { camera } = useThree()
  const pushed = useRef(false)

  useEffect(() => {
    /* stars condense out of the dark while the cover shows */
    if (!reduced) {
      const tw = gsap.to(shared.uForm, { value: 1, duration: 2.6, ease: 'power2.out', delay: 0.2 })
      return () => { tw.kill() }
    }
  }, [shared])

  useFrame(({ clock }) => {
    shared.uTime.value = clock.elapsedTime
    /* the night deepens as she reads toward the letter */
    shared.uDeep.value += (scrollState.progress - shared.uDeep.value) * 0.045

    if (skyState.open && !pushed.current) {
      pushed.current = true
      if (reduced) camera.position.z = 14
      else {
        gsap.to(camera.position, { z: 14, duration: DUR_PUSH, ease: 'expo.inOut' })
      }
    }
  })
  return null
}
const DUR_PUSH = 1.9

/* --------------------------- scene --------------------------- */
export default function Sky({ post }: { post: boolean }) {
  const [frozen, setFrozen] = useState(() => typeof document !== 'undefined' && document.hidden)

  useEffect(() => {
    const onVis = () => setFrozen(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  return (
    <div id="skyroot" aria-hidden="true">
      <Canvas
        flat
        dpr={[1, 2]}
        frameloop={frozen ? 'never' : 'always'}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 20], fov: 55 }}
      >
        <SceneBody post={post} />
      </Canvas>
    </div>
  )
}

function SceneBody({ post }: { post: boolean }) {
  const shared = useSharedUniforms()
  const boost = post ? 1.65 : 1.0
  return (
    <>
      <Rig shared={shared} />
      <Nebula shared={shared} />
      <StarLayer shared={shared} count={520} spread={70} z={-16} size={1.1} drift={0.28} />
      <StarLayer shared={shared} count={220} spread={52} z={-8} size={1.9} drift={0.7} />
      <StarLayer shared={shared} count={80} spread={40} z={-3} size={2.9} drift={1.25} />
      <StarLayer shared={shared} count={26} spread={56} z={-10} size={5.2} drift={0.5} flare boost={boost} />
      <Comet boost={boost} />
      <Comet boost={boost} />
      {post && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.95} luminanceSmoothing={0.2} radius={0.75} />
          <Noise opacity={0.05} />
        </EffectComposer>
      )}
    </>
  )
}
