# her echoes ✦ v2

A little kingdom, rebuilt — same words, new sky.
Vite + React + TypeScript · WebGL starfield (R3F) · Lenis · GSAP · Motion · matter-js.

## Repo layout

```
/                    ← the BUILT site (what GitHub Pages serves)
/assets              ← ⚠ the site's JS, CSS and fonts — the page is blank without it
/app                 ← the source code (edit here)
/app/src/content.ts  ← every word on the site lives in this one file
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
git add -A && git commit -m "v2 ✦ new sky" && git push
```

**Route B · web UI:** repo → *Add file → Upload files* → drag the **entire
contents** of this folder into the drop zone — *including dragging the `assets`
and `app` folders themselves* (the file picker can't select folders; drag them).
Commit. `.nojekyll` and `.github/` may be skipped by browsers — harmless for
Route B, but Route A is the safe path.

Pages stays on *Deploy from branch → main → /(root)* — no settings change.

## Editing the words

Everything she reads is in **`app/src/content.ts`**. Then:

```bash
cd app
npm install        # first time only
npm run dev        # live preview
npm run release    # build + sync into the repo root → commit & push
```

Adding a song = one entry in `OUR_SONGS` (YouTube id + optional backup id).

## Notes

- **Privacy** — `noindex` meta + `robots.txt`.
- **Tiers** — full WebGL sky + physics on capable devices; calm CSS sky elsewhere;
  `prefers-reduced-motion` honored throughout.
- **Music** — YouTube requires one tap before sound; the vinyl hint covers it.
  The mini-player is visible in the panel; audio keeps playing when it's closed.
- **Images** — moon/sunset stream from Wikimedia/Unsplash with painted fallbacks.
  Moon photo credit (CC BY-SA 3.0, Gregory H. Revera) sits in the site footer.
- If the page ever shows *“a piece of the sky is missing”*, the `assets/` folder
  didn’t make it up — re-upload it.

made under one sky ✦
