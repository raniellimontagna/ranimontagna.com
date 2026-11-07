import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

// New UI takes every color from theme tokens so light mode and the accent
// themes keep working. Terminal-like artifacts keep a terminal's colors.
const DIRS = [
  'src/shared/ui-2026',
  'src/shared/shell',
  'src/features/home/components/interlude',
  'src/features/home/components/live-work',
  'src/features/home/components/trajectory',
  'src/features/home/components/atto',
  'src/features/home/components/writing',
  'src/features/home/components/closing',
  'src/features/cases',
  'src/features/blog/components',
  'src/features/projects/components',
]
const ALLOW = [/terminal/i]
const HEX = /#[0-9a-fA-F]{3,8}\b/

function walk(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) return files
  for (const entry of readdirSync(dir)) {
    if (entry === '__tests__') continue
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path, files)
    else if (/\.(ts|tsx|css)$/.test(path)) files.push(path)
  }
  return files
}

function findHexOutsideAllowlist(dirs: string[]): string[] {
  return dirs
    .flatMap((dir) => walk(dir))
    .filter((file) => !ALLOW.some((rule) => rule.test(file)))
    .filter((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .some(
          (line) => HEX.test(line) && !line.includes('href=') && !line.trimStart().startsWith('//'),
        ),
    )
    .map((file) => relative(process.cwd(), file))
}

it('new UI uses theme tokens, not hex colors (except terminal artifacts)', () => {
  expect(findHexOutsideAllowlist(DIRS)).toEqual([])
})
