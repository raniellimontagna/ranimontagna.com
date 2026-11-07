import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

// Chrome on macOS (Metal) drops backdrop-filtered layers, text included, for one
// frame on physical mouse input (crbug.com/414525204). PR #80 removed every use.
const CSS_RULES = [/backdrop-filter\s*:(?!\s*none\b)/, /@apply[^;]*backdrop-/]
const TS_RULES = [/backdrop-(blur|filter)|backdropFilter/]

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === '__tests__' || entry === 'node_modules') continue
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path, files)
    else files.push(path)
  }
  return files
}

function findBackdropOffenders(root: string): string[] {
  const offenders: string[] = []
  for (const file of walk(root)) {
    if (file.endsWith('no-backdrop-filter.test.ts')) continue
    const rules = file.endsWith('.css') ? CSS_RULES : /\.(ts|tsx)$/.test(file) ? TS_RULES : null
    if (!rules) continue
    const source = readFileSync(file, 'utf8')
    if (rules.some((rule) => rule.test(source))) offenders.push(relative(process.cwd(), file))
  }
  return offenders
}

it('has no backdrop-filter or backdrop-blur in src (crbug.com/414525204)', () => {
  expect(findBackdropOffenders('src')).toEqual([])
})
