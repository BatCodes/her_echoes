import { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'
import { tilt } from '../lib/gyro'

/* A living night sky: three depth layers of shader stars with soft glow
   and twinkle, two wandering comets, and parallax fed by scroll,
   pointer and (when she allows it) the phone's own tilt. */

const VERT = `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPix;
  varying vec3 vColor;
  varying float vTw;
  void main() {
    vColor = aColor;
    vTw = 0.62 + 0.38 * sin(uTime * (0.55 + fract(aSeed) * 1.35) + aSeed * 6.283);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPix * (140.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const FRAG = `
  precision mediump float;
  varying vec3 vColor;
  varying float vTw;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float core = smoothstep(0.5, 0.0, d);
    float glow = core * core;
    float a = glow * vTw;
    if (a < 0.02) discard;
    gl_FragColor = vec4(vColor, a);
  }
`

const PALETTE = [
  new THREE.Color('#f7e3bf'), new THREE.Color('#eec07a'),
  new THREE.Color('#f2a9b4'), new THREE.Color('#c3bce0'), new THREE.Color('#ffffff'),
]

function StarLayer({ count, spread, z, size, drift }: {
  count: number; spread: number; z: number; size: number; drift: number
}) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const group = useRef<THREE.Points>(null)
  const { gl } = useThree()

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const seeds = new Float32Array(count)
    const cols = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.72
      pos[i * 3 + 2] = z + (Math.random() - 0.5) * 4
      sizes[i] = size * (0.5 + Math.random())
      seeds[i] = Math.random() * 100
      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)]
      cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    g.setAttribute('aColor', new THREE.BufferAttribute(cols, 3))
    return g
  }, [count, spread, z, size])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPix: { value: Math.min(gl.getPixelRatio(), 2) },
  }), [gl])

  useFrame(({ clock, pointer }) => {
    if (mat.current) mat.current.uniforms.uTime.value = clock.elapsedTime
    const g = group.current
    if (!g) return
    const px = tilt.on ? tilt.x : pointer.x
    const py = tilt.on ? tilt.y : pointer.y
    // parallax: nearer layers move more; scroll drifts the sky upward
    g.position.x += ((px * drift) - g.position.x) * 0.04
    g.position.y += ((-py * drift * 0.6 + scrollState.progress * drift * 3.2) - g.position.y) * 0.04
  })

  return (
    <points ref={group} geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function Comet() {
  const line = useRef<THREE.Line>(null)
  const state = useRef({ life: -Math.random() * 9, x: 0, y: 0, vx: 0, vy: 0 })
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
    return g
  }, [])
  const material = useMemo(() => new THREE.LineBasicMaterial({
    color: '#f7e3bf', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
  }), [])

  useFrame((_, dt) => {
    const s = state.current
    s.life += dt
    if (s.life < 0) return
    if (s.life === dt || s.life > 2.4) {
      // respawn
      s.life = -6 - Math.random() * 8
      s.x = (Math.random() - 0.5) * 30
      s.y = 8 + Math.random() * 6
      const ang = Math.PI * (1.15 + Math.random() * 0.25)
      const sp = 14 + Math.random() * 8
      s.vx = Math.cos(ang) * sp
      s.vy = Math.sin(ang) * sp
      material.opacity = 0
      return
    }
    s.x += s.vx * dt; s.y += s.vy * dt
    const t = s.life / 2.4
    material.opacity = Math.sin(Math.PI * Math.min(1, t)) * 0.75
    const tail = 0.13
    const attr = geom.getAttribute('position') as THREE.BufferAttribute
    attr.setXYZ(0, s.x, s.y, -6)
    attr.setXYZ(1, s.x - s.vx * tail, s.y - s.vy * tail, -6)
    attr.needsUpdate = true
  })

  // three r150+: <line> primitive conflicts with SVG types — construct manually
  useEffect(() => {
    const obj = line.current
    return () => { obj?.geometry.dispose() }
  }, [])

  return <primitive ref={line} object={useMemo(() => new THREE.Line(geom, material), [geom, material])} />
}

export default function Sky() {
  return (
    <div id="skyroot" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 14], fov: 55 }}
      >
        <StarLayer count={620} spread={64} z={-16} size={1.1} drift={0.28} />
        <StarLayer count={240} spread={48} z={-8} size={1.9} drift={0.7} />
        <StarLayer count={90} spread={38} z={-3} size={2.9} drift={1.25} />
        <Comet />
        <Comet />
      </Canvas>
    </div>
  )
}
