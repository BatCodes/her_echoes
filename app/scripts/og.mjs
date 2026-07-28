/* og.mjs — renders og.png (1200×630) from the hero's own vectors,
   so the WhatsApp unfurl finally matches what's inside.
   No fonts needed: "Hajra" ships as outlines in src/lib/namePath.ts. */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'

const here = path.dirname(fileURLToPath(import.meta.url))
const src = readFileSync(path.resolve(here, '../src/lib/namePath.ts'), 'utf8')
const m = src.match(/NAME_SVG_INNER = "([\s\S]*)"\s*$/m)
if (!m) throw new Error('could not extract NAME_SVG_INNER')
const nameInner = m[1].replace(/\\"/g, '"')

/* deterministic stars — same sky every build */
let seed = 20260126
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648

const PAL = ['#f7e3bf', '#eec07a', '#f2a9b4', '#c3bce0', '#ffffff']
let stars = ''
for (let i = 0; i < 110; i++) {
  const x = rnd() * 1200, y = rnd() * 630
  if (x > 240 && x < 960 && y > 150 && y < 520) continue /* keep the name zone clear */
  const r = 0.7 + rnd() * 1.9
  stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${PAL[Math.floor(rnd() * PAL.length)]}" opacity="${(0.3 + rnd() * 0.6).toFixed(2)}"/>`
}
let heroes = ''
const HP = [[150, 120], [1050, 180], [220, 480], [980, 470], [90, 300], [1130, 330], [600, 80]]
for (const [x, y] of HP) {
  heroes += `
  <g opacity="${(0.65 + rnd() * 0.3).toFixed(2)}">
    <circle cx="${x}" cy="${y}" r="2.6" fill="#ffd9a0" filter="url(#glow)"/>
    <path d="M${x - 12} ${y} H${x + 12} M${x} ${y - 12} V${y + 12}" stroke="#eec07a" stroke-width="1.1" opacity=".7"/>
  </g>`
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="bg" cx="50%" cy="0%" r="120%">
      <stop offset="0%" stop-color="#231a4c"/>
      <stop offset="52%" stop-color="#14102c"/>
      <stop offset="100%" stop-color="#0e0b21"/>
    </radialGradient>
    <filter id="blur60" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="46"/></filter>
    <filter id="glow" x="-300%" y="-300%" width="700%" height="700%">
      <feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="nameglow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="11" result="b"/>
      <feFlood flood-color="#eec07a" flood-opacity=".55" result="c"/>
      <feComposite in="c" in2="b" operator="in" result="g"/>
      <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <ellipse cx="260" cy="200" rx="360" ry="190" fill="rgba(74,58,140,.34)" filter="url(#blur60)"/>
  <ellipse cx="950" cy="460" rx="330" ry="170" fill="rgba(238,192,122,.10)" filter="url(#blur60)"/>
  <ellipse cx="880" cy="120" rx="240" ry="130" fill="rgba(242,169,180,.08)" filter="url(#blur60)"/>

  ${stars}
  ${heroes}

  <!-- moon, top right — ma hon sitara, tu ha chand mera -->
  <g transform="translate(1064,84)">
    <circle r="34" fill="#eec07a" filter="url(#glow)"/>
    <circle cx="-9" cy="-4" r="32" fill="#14102c"/>
    <circle cx="-46" cy="18" r="3" fill="#f7e3bf" filter="url(#glow)"/>
  </g>

  <!-- tiara -->
  <g transform="translate(545,96) scale(1.0)">
    <path d="M8 52 L14 20 L34 40 L55 8 L76 40 L96 20 L102 52 Z" fill="none" stroke="#EEC07A" stroke-width="2.5" stroke-linejoin="round" filter="url(#glow)"/>
    <rect x="8" y="52" width="94" height="6" rx="3" fill="#EEC07A"/>
    <circle cx="55" cy="8" r="4" fill="#F2A9B4"/><circle cx="14" cy="20" r="3" fill="#F2A9B4"/><circle cx="96" cy="20" r="3" fill="#F2A9B4"/>
  </g>

  <!-- Hajra — her name, in its own handwriting vectors -->
  <g transform="translate(288,196) scale(0.625)" fill="#f7e3bf" stroke="none" filter="url(#nameglow)">
    ${nameInner}
  </g>

  <!-- swash -->
  <g transform="translate(535,540)">
    <path d="M4 8 C 30 12, 46 4, 65 8 C 84 12, 100 4, 126 8" fill="none" stroke="#EEC07A" stroke-width="1.6" opacity=".8"/>
    <circle cx="65" cy="8" r="2.2" fill="#F2A9B4"/>
  </g>

  <text x="600" y="588" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="21" fill="#c3bce0" opacity=".85">princess of earths &amp; skies — a little kingdom, under one sky</text>
</svg>`

const png = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1080 }, /* keeps the file WhatsApp-friendly (<300 kB) */
  font: { loadSystemFonts: true }, /* Georgia italic for the single caption line */
}).render().asPng()

writeFileSync(path.resolve(here, '../public/og.png'), png)
console.log(`✓ og.png rendered (${(png.length / 1024).toFixed(0)} kB) → app/public/og.png`)
