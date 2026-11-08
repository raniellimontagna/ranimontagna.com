import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { CASES } from '@/features/cases/cases.data'
import { ATTO_CASES } from '@/features/home/components/atto/atto.data'
import { CYCLE_CHAPTERS } from '@/features/home/components/cycle/cycle.data'
import { LIVE_WORK } from '@/features/home/components/live-work/live-work.data'

// Images are replaced under new names: a file swapped in place keeps being
// served from browser and CDN caches for days.
const scenes = [
  ...CYCLE_CHAPTERS.map((chapter) => chapter.background),
  ...LIVE_WORK.flatMap((item) => (item.image ? [item.image.src] : [])).filter((src) =>
    src.startsWith('/redesign/scenes/'),
  ),
]

const referenced = [
  ...scenes,
  ...LIVE_WORK.flatMap((item) => (item.image ? [item.image.src] : [])),
  ...Object.values(CASES).flatMap((study) => [
    study.hero.src,
    ...study.gallery.map((image) => image.src),
  ]),
  ...ATTO_CASES.flatMap((item) => (item.image ? [item.image] : [])),
]

describe('site images', () => {
  it('scene backgrounds reference the current Codex renders', () => {
    expect(scenes.length).toBeGreaterThanOrEqual(5)
    for (const src of scenes) expect(src).toMatch(/^\/redesign\/scenes\/[a-z-]+-codex\.webp$/)
    expect(scenes).toContain('/redesign/scenes/pain-codex.webp')
  })

  it('every referenced image exists in public/', () => {
    for (const src of referenced)
      expect(existsSync(join(process.cwd(), 'public', src)), src).toBe(true)
  })

  it('project cards use the framed real captures', () => {
    const cover = (slug: string) => LIVE_WORK.find((item) => item.slug === slug)?.image?.src
    expect(cover('klick')).toBe('/redesign/products/frame-klick.webp')
    expect(cover('grimory')).toBe('/redesign/products/frame-grimory.webp')
  })
})
