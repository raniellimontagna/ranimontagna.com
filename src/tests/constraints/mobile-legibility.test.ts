import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOTS = ['src/features/home', 'src/shared/vega', 'src/shared/shell']

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sources(path)
    return /\.tsx?$/.test(name) ? [path] : []
  })
}

// Mobile round §5: nothing under 12 px on the home, in Vega or in the shell.
it('sets no text below 12 px on the home, in Vega or in the shell', () => {
  const offenders = ROOTS.flatMap(sources).filter((file) =>
    /text-\[(?:[0-9]|1[01])(?:\.\d+)?px\]/.test(readFileSync(file, 'utf8')),
  )
  expect(offenders).toEqual([])
})
