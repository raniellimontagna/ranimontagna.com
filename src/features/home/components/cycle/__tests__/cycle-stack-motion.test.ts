import type { ScrollMotion } from '@/shared/components/motion'
import { buildCycleStack } from '../cycle-stack-motion'

type Config = {
  id?: string
  trigger?: Element
  start?: string | (() => string)
  end?: string | (() => string)
  pin?: boolean
  once?: boolean
  onUpdate?: (self: { progress: number }) => void
  onEnter?: () => void
}

const SCENE_HEIGHT = 800

function fakeMotion() {
  const created: Config[] = []
  const kills: Array<ReturnType<typeof vi.fn>> = []
  const ScrollTrigger = {
    create: vi.fn((config: Config) => {
      created.push(config)
      const kill = vi.fn()
      kills.push(kill)
      return { kill }
    }),
  }
  const tween = { revert: vi.fn(), kill: vi.fn() }
  const gsap = { fromTo: vi.fn(() => tween), set: vi.fn(), to: vi.fn() }
  return { motion: { gsap, ScrollTrigger } as unknown as ScrollMotion, created, kills, gsap, tween }
}

function makeRoot() {
  const root = document.createElement('section')
  root.innerHTML = `
    <div data-stack-bars>${'<span data-stack-bar></span>'.repeat(4)}</div>
    ${['pain', 'solution', 'product', 'code']
      .map(
        (id) =>
          `<article data-scene="${id}"><img data-scene-bg /><div data-scene-art><p data-reveal></p></div><div data-scene-dim></div></article>`,
      )
      .join('')}
    <div data-stack-spacer></div>`
  for (const scene of root.querySelectorAll<HTMLElement>('[data-scene]')) {
    Object.defineProperty(scene, 'offsetHeight', { value: SCENE_HEIGHT, configurable: true })
  }
  document.body.appendChild(root)
  return root
}

const resolve = (value: Config['start']) => (typeof value === 'function' ? value() : value)
const byId = (created: Config[], id: string) => {
  const config = created.find((item) => item.id === id)
  if (!config) throw new Error(`no trigger ${id}`)
  return config
}

describe('buildCycleStack', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('never pins', () => {
    const { motion, created } = fakeMotion()
    buildCycleStack(motion, makeRoot())
    expect(created.length).toBeGreaterThan(0)
    for (const config of created) expect(config.pin).toBeFalsy()
  })

  it('measures from the section, one screen per chapter, never from a sticky chapter', () => {
    const { motion, created } = fakeMotion()
    const root = makeRoot()
    buildCycleStack(motion, root)
    const cover = byId(created, 'cycle-cover-0')
    expect(cover.trigger).toBe(root)
    expect(resolve(cover.start)).toBe(`top+=${SCENE_HEIGHT} bottom`)
    expect(resolve(cover.end)).toBe(`top+=${SCENE_HEIGHT} top`)
  })

  it('scales and dims the chapter being covered', () => {
    const { motion, created } = fakeMotion()
    const root = makeRoot()
    buildCycleStack(motion, root)
    byId(created, 'cycle-cover-0').onUpdate?.({ progress: 0.5 })
    const scene = root.querySelector<HTMLElement>('[data-scene="pain"]')
    expect(scene?.style.transform).toContain('scale(0.95)')
    expect(scene?.style.borderRadius).toBe('9px')
    expect(scene?.querySelector<HTMLElement>('[data-scene-dim]')?.style.opacity).toBe('0.3')
    expect(root.querySelectorAll<HTMLElement>('[data-stack-bar]')[0].style.transform).toBe(
      'scaleX(0.5)',
    )
  })

  it('fills the last bar over the reading spacer, to the end of the section', () => {
    const { motion, created } = fakeMotion()
    const root = makeRoot()
    buildCycleStack(motion, root)
    const last = byId(created, 'cycle-last-bar')
    expect(resolve(last.start)).toBe(`top+=${SCENE_HEIGHT * 3} top`)
    expect(resolve(last.end)).toBe('bottom bottom')
    last.onUpdate?.({ progress: 0.25 })
    expect(root.querySelectorAll<HTMLElement>('[data-stack-bar]')[3].style.transform).toBe(
      'scaleX(0.25)',
    )
  })

  it('zooms each background from 1.12', () => {
    const { motion, gsap } = fakeMotion()
    buildCycleStack(motion, makeRoot())
    expect(gsap.fromTo).toHaveBeenCalledTimes(4)
    expect(gsap.fromTo).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      { scale: 1.12 },
      expect.objectContaining({ scale: 1, ease: 'none' }),
    )
  })

  it('prepares only artifacts below the fold and plays them once as the chapter settles', () => {
    const { motion, created, gsap } = fakeMotion()
    const root = makeRoot()
    const arts = root.querySelectorAll<HTMLElement>('[data-scene-art]')
    arts.forEach((art, index) => {
      art.getBoundingClientRect = () =>
        ({ top: index === 0 ? 10 : window.innerHeight + 500 }) as DOMRect
    })
    buildCycleStack(motion, root)
    expect(created.find((config) => config.id === 'cycle-play-0')).toBeUndefined()
    const play = byId(created, 'cycle-play-1')
    expect(play.once).toBe(true)
    expect(resolve(play.start)).toBe(`top+=${SCENE_HEIGHT} top`)
    // pain (index 0) was on screen: never hidden.
    expect(gsap.set).not.toHaveBeenCalledWith(
      arts[0].querySelectorAll('p[data-reveal]'),
      expect.anything(),
    )
  })

  it('cleanup removes inline styles, kills its triggers and drops data-stacked', () => {
    const { motion, created, kills, tween } = fakeMotion()
    const root = makeRoot()
    const cleanup = buildCycleStack(motion, root)
    expect(root.dataset.stacked).toBe('true')
    byId(created, 'cycle-cover-0').onUpdate?.({ progress: 1 })
    cleanup()
    const scene = root.querySelector<HTMLElement>('[data-scene="pain"]')
    expect(scene?.style.transform).toBe('')
    expect(scene?.style.borderRadius).toBe('')
    expect(root.querySelectorAll<HTMLElement>('[data-stack-bar]')[0].style.transform).toBe('')
    expect(root.dataset.stacked).toBeUndefined()
    for (const kill of kills) expect(kill).toHaveBeenCalled()
    expect(tween.revert).toHaveBeenCalled()
  })
})
