import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { CYCLE_CHAPTERS } from '@/features/home/components/cycle/cycle.data'
import { LIVE_WORK } from '@/features/home/components/live-work/live-work.data'

// Scene images are replaced under new names: a file swapped in place keeps
// being served from browser and CDN caches for days.
const scenes = [
  ...CYCLE_CHAPTERS.map((chapter) => chapter.background),
  ...LIVE_WORK.flatMap((item) => (item.image ? [item.image.src] : [])).filter((src) =>
    src.startsWith('/redesign/scenes/'),
  ),
]

describe('scene images', () => {
  it('reference the current Codex renders', () => {
    expect(scenes.length).toBeGreaterThanOrEqual(5)
    for (const src of scenes) expect(src).toMatch(/^\/redesign\/scenes\/[a-z-]+-codex\.webp$/)
  })

  it('exist in public/', () => {
    for (const src of scenes) expect(existsSync(join(process.cwd(), 'public', src)), src).toBe(true)
  })
})
