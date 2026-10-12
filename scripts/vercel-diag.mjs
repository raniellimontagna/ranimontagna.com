// TEMPORARY: inspect where the Vercel adapter leaves build outputs.
import { lstat, readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const roots = ['.next', '.next/server/app', '.next/static', '.vercel/output', '/vercel/output']

async function walk(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true, recursive: true })
    return entries.filter((e) => !e.isDirectory()).map((e) => join(e.parentPath, e.name))
  } catch {
    return null
  }
}

console.log('diag: cwd', process.cwd())
console.log(
  'diag: env names',
  Object.keys(process.env)
    .filter((k) => /OUTPUT|VERCEL_BUILD|NEXT_ADAPTER|BUILD_DIR/.test(k))
    .join(','),
)

const listings = {}
for (const root of roots) {
  const files = await walk(root)
  listings[root] = files
  if (!files) {
    console.log(`diag: ${root} missing`)
    continue
  }
  const byExt = {}
  for (const f of files) {
    const ext = f.includes('.') ? f.slice(f.lastIndexOf('.')) : '(none)'
    byExt[ext] = (byExt[ext] ?? 0) + 1
  }
  console.log(`diag: ${root} files=${files.length}`, JSON.stringify(byExt).slice(0, 300))
  const html = files.filter((f) => f.endsWith('.html'))
  console.log(`diag: ${root} html sample`, html.slice(0, 6).join(' | '))
}

const out = listings['/vercel/output'] ?? listings['.vercel/output'] ?? []
const enHtml = out.find((f) => /\/en(\.prerender-fallback)?\.html$/.test(f))
console.log('diag: en html', enHtml)
if (enHtml) {
  const src = (await readFile(enHtml, 'utf8')).match(/<script[^>]*src="([^"]+)"/)?.[1]
  console.log('diag: first script', src)
  const name = src?.split('?')[0].split('/').pop()
  for (const f of [...out, ...(listings['.next/static'] ?? [])].filter((f) => f.endsWith(`/${name}`))) {
    const s = await lstat(f)
    console.log('diag: copy', f, 'ino', s.ino, 'nlink', s.nlink, 'symlink', s.isSymbolicLink())
  }
}
console.log('diag: config.json', (await readFile('/vercel/output/config.json', 'utf8').catch(() => 'missing')).slice(0, 200))
