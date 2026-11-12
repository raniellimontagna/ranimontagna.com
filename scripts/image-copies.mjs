// Pre-sized AVIF and WebP copies of the site images listed in src/shared/lib/image-copies/copies.json.
// Run: pnpm images:copies
import { mkdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

// sharp comes with Next.js (pnpm does not hoist it to the root).
const require = createRequire(createRequire(import.meta.url).resolve('next/package.json'))
const sharp = require('sharp')

const manifest = JSON.parse(readFileSync('src/shared/lib/image-copies/copies.json', 'utf8'))
const out = join('public', manifest.dir)
mkdirSync(out, { recursive: true })

// Same rule as copyWidths() in image-copies.ts.
const widthsFor = (preset, masterWidth) => {
  const widths = preset.widths.filter((width) => width <= masterWidth)
  return widths.includes(masterWidth) || preset.widths.every((width) => width <= masterWidth)
    ? widths
    : [...widths, masterWidth]
}

for (const [master, entry] of Object.entries(manifest.masters)) {
  const preset = manifest.presets[entry.preset]
  const input = join('public', master)
  const { width, height } = await sharp(input).metadata()
  if (width !== entry.width || height !== entry.height) {
    throw new Error(
      `${master} is ${width}x${height}, copies.json says ${entry.width}x${entry.height}`,
    )
  }
  const name = master
    .replace(/^\//, '')
    .replace(/\.webp$/, '')
    .replaceAll('/', '-')
  for (const w of widthsFor(preset, width)) {
    await sharp(input)
      .resize({ width: w })
      .avif({ quality: preset.avif, effort: 6 })
      .toFile(join(out, `${name}-${w}.avif`))
    await sharp(input)
      .resize({ width: w })
      .webp({ quality: preset.webp, effort: 6 })
      .toFile(join(out, `${name}-${w}.webp`))
  }
  console.log(master, entry.preset, widthsFor(preset, width).join('/'))
}
