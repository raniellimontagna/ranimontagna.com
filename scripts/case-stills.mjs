// Pre-sized AVIF and WebP copies of the case screens (src/features/cases/case-stills.ts).
// Masters: public/redesign/cases/v1/<case>-<desk|phone>-<screen>.webp. Run: pnpm cases:stills
import { mkdirSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

// sharp comes with Next.js (pnpm does not hoist it to the root).
const require = createRequire(createRequire(import.meta.url).resolve('next/package.json'))
const sharp = require('sharp')

const DIR = 'public/redesign/cases/v1'
const OUT = join(DIR, 'sized')
const WIDTHS = { desk: [640, 1080, 1600, 2400], phone: [320, 480, 720] }

mkdirSync(OUT, { recursive: true })
const masters = readdirSync(DIR).filter((file) => /^[a-z]+-(desk|phone)-[a-z]+\.webp$/.test(file))
for (const file of masters) {
  const kind = file.includes('-desk-') ? 'desk' : 'phone'
  const name = file.replace(/\.webp$/, '')
  const { width: masterWidth } = await sharp(join(DIR, file)).metadata()
  for (const width of WIDTHS[kind]) {
    // Never enlarge: a copy wider than its master is the master's width under the listed name.
    const resized = () => sharp(join(DIR, file)).resize({ width: Math.min(width, masterWidth) })
    await resized()
      .avif({ quality: 55, effort: 6 })
      .toFile(join(OUT, `${name}-${width}.avif`))
    await resized()
      .webp({ quality: 76, effort: 6 })
      .toFile(join(OUT, `${name}-${width}.webp`))
  }
  console.log(file, kind, masterWidth)
}
