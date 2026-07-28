# her echoes ✦ v2.1

A little kingdom, cinematized — same words, a sky that finally glows.
Vite + React + TypeScript · WebGL sky with real bloom & nebula (R3F + postprocessing) · Lenis · GSAP ScrollTrigger · Motion · matter-js physics.

## What v2.1 adds over v2

- **The sky became real** — shader nebula that deepens from dusk to true night as she scrolls, HDR gold stars that *bloom*, comet trails, star condensation on load, camera push-through when the cover opens, gyro + pointer parallax.
- **v1's warmth restored** — cream storybook paper (confessions, promise scroll, decree, letter), the arched gold mirror, button sheen sweeps, section colour auras, title flourishes, the name at full v1 scale.
- **Every toy upgraded** — spring-physics love-meter that slams past 100% with a screen-edge glow; a star that escapes the jar before each memory; wax that crumbles into gold debris; the letter unfolds in 3D and its words arrive as ink; three-speed photo parallax with per-scene colour grades.
- **The polish layer** — trailing cursor star (desktop), magnetic gold buttons, foreground dust motes, film grain that breathes.
- **Smoothness engineering** — three device tiers (full = WebGL + bloom + physics · mid = WebGL, no post · lite = CSS sky), DPR capped at 2, Three.js chunk lazy-loaded after first paint, scene pauses off-tab, meaningful pre-hydration skeleton, `prefers-reduced-motion` honored everywhere.
- **OG image** rendered from the hero's own vectors (`npm run og`) — the WhatsApp unfurl matches the site.

## Repo layout

```
/                    ← the BUILT site (what GitHub Pages serves)
/assets              ← ⚠ the site's JS, CSS and fonts — the page is blank without it
/app                 ← the source code (edit here)
/app/src/content.ts  ← every word on the site lives in this one file
/app/src/lib/motion.ts ← the motion language (eases, durations) — one hand animates everything
/.github/workflows   ← optional CI deploy (manual trigger)
```

## Deploying — the folder matters

The site is not just `index.html`: **the `assets/` folder must be in the repo**,
or the page loads empty.

**Route A · git (recommended, always complete):**

```bash
git clone https://github.com/BatCodes/her_echoes && cd her_echoes
git rm -r -q .                       # clear the old contents
cp -r /path/to/her_echoes_upload/. . # copy EVERYTHING from this folder (incl. dotfiles)
git add -A && git commit -m "v2.1 ✦ the sky glows" && git push
```

**Route B · web UI:** repo → *Add file → Upload files* → drag the **entire
contents** of this folder into the drop zone — *including dragging the `assets`
and `app` folders themselves*. Commit.

Pages stays on *Deploy from branch → main → /(root)* — no settings change.

## Editing the words

Everything she reads is in **`app/src/content.ts`**. Then:

```bash
cd app
npm install        # first time only
npm run dev        # live preview
npm run release    # og + build + sync into the repo root → commit & push
```

Adding a song = one entry in `OUR_SONGS` (YouTube id + optional backup id).

## Notes

- **Privacy** — `noindex` meta + `robots.txt`.
- **Tiers** — full WebGL sky + bloom + physics on capable devices; WebGL without
  post-processing on most phones; calm CSS sky elsewhere; `prefers-reduced-motion`
  honored throughout.
- **Music** — YouTube requires one tap before sound; the vinyl hint covers it.
  The visible mini-player sits in the glass panel; audio keeps playing when closed.
- **Images** — moon/sunset stream from Wikimedia/Unsplash with painted fallbacks.
  Moon photo credit (CC BY-SA 3.0, Gregory H. Revera) sits in the site footer.
- If the page ever shows *"a piece of the sky is missing"*, the `assets/` folder
  didn't make it up — re-upload it.

made under one sky ✦
