// Marks the scripts that pages execute on load with V8's explicit compile hint,
// so Chrome compiles their functions eagerly on a background thread while the
// file streams in.
//
// Without it, every Turbopack module factory is compiled lazily on the main
// thread the first time it runs. On the home that was ~160 ms of
// V8.CompileCode/ParseFunction inside the single boot task (CPU 4x), the
// largest remaining chunk of Total Blocking Time.
//
// Only startup scripts get the hint: the root main files plus the entry chunks
// of each layout and page, which the prerendered HTML loads with <script src>.
// Chunks loaded later (WebGL background, chat, GSAP) keep lazy compilation.
// Browsers without the feature treat the line as a comment.
// https://v8.dev/blog/explicit-compile-hints
//
// `addCompileHints` runs from compiler.runAfterProductionCompile in
// next.config.ts. It has to happen inside `next build`: on Vercel the adapter
// collects the static files before the build command returns, so edits made
// afterwards never reach the deployment. Running this file after the build
// checks that every startup script in the prerendered HTML got the hint.

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { runInNewContext } from 'node:vm'

const HINT = '//# allFunctionsCalledOnLoad\n'
const STATIC_URL_PREFIX = '/_next/static/'
const SCRIPT_TAG = /<script\b[^>]*>/g
const SRC_ATTRIBUTE = /\bsrc="([^"]+)"/
const CLIENT_MANIFEST_SUFFIX = '_client-reference-manifest.js'

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

async function readClientManifests(appDir) {
  const files = (await listFiles(appDir)).filter((file) => file.endsWith(CLIENT_MANIFEST_SUFFIX))
  const manifests = []

  for (const file of files) {
    // Each file assigns its entries to globalThis.__RSC_MANIFEST.
    const context = {}
    runInNewContext(await readFile(file, 'utf8'), context)
    manifests.push(...Object.values(context.__RSC_MANIFEST ?? {}))
  }

  return manifests
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

export async function addCompileHints(distDir = '.next') {
  const nextDir = resolve(distDir)
  const buildManifest = JSON.parse(await readFile(join(nextDir, 'build-manifest.json'), 'utf8'))
  const manifests = await readClientManifests(join(nextDir, 'server', 'app'))

  // Paths are relative to /_next/, e.g. static/chunks/0d10el67075df.js.
  const chunks = new Set(buildManifest.rootMainFiles ?? [])
  for (const manifest of manifests) {
    for (const files of Object.values(manifest.entryJSFiles ?? {})) {
      for (const file of files) chunks.add(file)
    }
  }

  let marked = 0
  for (const chunk of chunks) {
    if (!chunk.startsWith('static/') || !chunk.endsWith('.js')) continue

    try {
      if (await addHint(join(nextDir, chunk))) marked += 1
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      console.warn(`compile-hints: ${chunk} not found under ${nextDir}`)
    }
  }

  const summary = `compile-hints: ${marked} startup scripts marked (${chunks.size} listed in ${manifests.length} client manifests)`
  // A build without client manifests still ships; it just loses the hint.
  if (marked === 0) console.warn(summary)
  else console.log(summary)
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

async function checkCompileHints(distDir = '.next') {
  const nextDir = resolve(distDir)
  const staticDir = join(nextDir, 'static')
  // A plain `next build` writes prerendered HTML to server/app. On Vercel, whose
  // adapter takes over the outputs, it lands in server/route-cache instead.
  const htmlFiles = (await listFiles(join(nextDir, 'server'))).filter((file) =>
    file.endsWith('.html'),
  )

  const urls = new Set()
  for (const file of htmlFiles) {
    for (const url of startupScriptUrls(await readFile(file, 'utf8'))) urls.add(url)
  }

  const staticFiles = await listFiles(staticDir)
  const byName = new Map(staticFiles.map((file) => [basename(file), file]))
  const missing = []

  for (const url of urls) {
    const direct = join(staticDir, url.slice(STATIC_URL_PREFIX.length))
    const file = staticFiles.includes(direct) ? direct : byName.get(basename(url))
    if (!file || !(await readFile(file, 'utf8')).startsWith(HINT)) missing.push(url)
  }

  const summary = `compile-hints: ${urls.size - missing.length} of ${urls.size} startup scripts in ${htmlFiles.length} prerendered pages carry the hint`
  if (missing.length > 0) console.warn(`${summary}; missing ${missing.slice(0, 5).join(', ')}`)
  else console.log(summary)
}

// No top-level await: next.config.ts may load this module with require().
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  checkCompileHints(process.argv[2]).catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
