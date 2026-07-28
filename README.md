# her echoes ✦ v2

A little kingdom — Vite + React + TypeScript · WebGL starfield · Lenis · GSAP · Motion · matter-js.
Every word she reads lives in one source file (`src/content.ts` in the app source).

## This repo = the built site, flat on purpose

There are **no folders** — every file the site needs sits at the root, because
GitHub's web uploader can't upload folders. To deploy an update:

1. repo → **Add file → Upload files**
2. open the site folder on your computer → **select ALL files** (Ctrl/Cmd+A)
3. drag them into the drop zone → **Commit**

If the page ever says *“a few pages of the storybook are missing”*, some files
were skipped — repeat with all of them selected.

## Editing the site

The source code ships alongside this repo (the `app-source` folder in the
delivery zip — keep it safe, or push it here with git):

```bash
cd app-source
npm install     # first time only
npm run dev     # live preview
npm run build   # → dist/ = the new flat site files to upload
```

## Notes

- `noindex` + `robots.txt` keep search engines out.
- Full WebGL sky + physics on capable phones; calm CSS sky elsewhere;
  `prefers-reduced-motion` honored.
- YouTube needs one tap before sound — the vinyl hint covers it.
- Moon photo credit (CC BY-SA 3.0, Gregory H. Revera) is in the site footer.

made under one sky ✦
