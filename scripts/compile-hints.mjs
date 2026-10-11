// Runs after `next build`. Marks the scripts that pages execute on load with
// V8's explicit compile hint, so Chrome compiles their functions eagerly on a
// background thread while the file streams in.
//
// Without it, every Turbopack module factory is compiled lazily on the main
// thread the first time it runs. On the home that was ~160 ms of
// V8.CompileCode/ParseFunction inside the single boot task (CPU 4x), the
// largest remaining chunk of Total Blocking Time.
//
// Only startup scripts get the hint: the <script src> tags in the prerendered
// HTML. Chunks loaded later (WebGL background, chat, GSAP) keep lazy
// compilation. Browsers without the feature treat the line as a comment.
// https://v8.dev/blog/explicit-compile-hints

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join, relative, resolve } from 'node:path'

const HINT = '//# allFunctionsCalledOnLoad\n'
const STATIC_URL_PREFIX = '/_next/static/'
const SCRIPT_TAG = /<script\b[^>]*>/g
const SRC_ATTRIBUTE = /\bsrc="([^"]+)"/

async function listFiles(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true, recursive: true })
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => join(entry.parentPath, entry.name))
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

function startupScriptUrls(html) {
  const urls = []

  for (const [tag] of html.matchAll(SCRIPT_TAG)) {
    // Polyfills only run in browsers without ES modules, which ignore the hint.
    if (/\bnomodule\b/i.test(tag)) continue

    const src = tag.match(SRC_ATTRIBUTE)?.[1]
    if (src?.startsWith(STATIC_URL_PREFIX) && src.split('?')[0].endsWith('.js')) {
      urls.push(src.split('?')[0])
    }
  }

  return urls
}

async function addHint(file) {
  const code = await readFile(file, 'utf8')
  if (code.startsWith(HINT)) return false

  await writeFile(file, HINT + code)

  // Keep an external source map aligned: the hint adds one generated line.
  try {
    const map = JSON.parse(await readFile(`${file}.map`, 'utf8'))
    map.mappings = `;${map.mappings}`
    await writeFile(`${file}.map`, JSON.stringify(map))
  } catch {
    // No source map next to the chunk.
  }

  return true
}

async function main() {
  const nextDir = resolve(process.argv[2] ?? '.next')
  const staticDir = join(nextDir, 'static')
  const htmlFiles = (await listFiles(join(nextDir, 'server', 'app'))).filter((file) =>
    file.endsWith('.html'),
  )

  const urls = new Set()
  for (const file of htmlFiles) {
    for (const url of startupScriptUrls(await readFile(file, 'utf8'))) urls.add(url)
  }

  const staticFiles = await listFiles(staticDir)
  const byName = new Map(staticFiles.map((file) => [basename(file), file]))
  const targets = new Set()

  for (const url of urls) {
    const direct = join(staticDir, url.slice(STATIC_URL_PREFIX.length))
    const file = staticFiles.includes(direct) ? direct : byName.get(basename(url))
    if (file) targets.add(file)
    else console.warn(`compile-hints: ${url} not found under ${relative('.', staticDir)}`)
  }

  let marked = 0
  for (const file of targets) {
    if (await addHint(file)) marked += 1
  }

  const summary = `compile-hints: ${marked} startup scripts marked (${targets.size} found in ${htmlFiles.length} prerendered pages)`
  // A build without prerendered pages still ships; it just loses the hint.
  if (targets.size === 0) console.warn(summary)
  else console.log(summary)
}

await main()
