/* npm run release — builds the app and syncs dist/ into the repo root,
   so the existing GitHub Pages (branch → root) setup keeps serving it. */
import { cpSync, rmSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const dist = path.resolve(here, '../dist')
const root = path.resolve(here, '../..')

rmSync(path.join(root, 'assets'), { recursive: true, force: true })
for (const entry of readdirSync(dist)) {
  cpSync(path.join(dist, entry), path.join(root, entry), { recursive: true })
}
console.log('✓ dist synced to repo root — commit & push to deploy')
