import type { ScrollMotion } from '@/shared/components/motion'
import { buildWritingFocus } from '../writing-focus'

type Config = {
  trigger?: Element
  start?: string
  end?: string
  onUpdate?: (self: { progress: number }) => void
  onRefresh?: () => void
}

function setup() {
  const list = document.createElement('ul')
  list.style.setProperty('--dim-large', '0.4')
  list.innerHTML =
    '<li><a><img data-post-thumb /><span data-post-title>t</span><span data-post-date>d</span></a></li>'.repeat(
      2,
    )
  for (const row of list.querySelectorAll<HTMLElement>('li')) {
    Object.defineProperty(row, 'offsetHeight', { value: 100, configurable: true })
  }
  document.body.appendChild(list)
  const created: Config[] = []
  const kill = vi.fn()
  const motion = {
    gsap: {},
    ScrollTrigger: {
      create: vi.fn((config: Config) => {
        created.push(config)
        return { kill, progress: 0 }
      }),
    },
  } as unknown as ScrollMotion
  return { list, created, kill, motion }
}

const row = (list: HTMLElement, index = 0) => list.querySelectorAll('li')[index]
const title = (list: HTMLElement) => row(list).querySelector<HTMLElement>('[data-post-title]')
const thumb = (list: HTMLElement) => row(list).querySelector<HTMLElement>('[data-post-thumb]')

describe('buildWritingFocus', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('follows each row through the whole screen', () => {
    const { list, created, motion } = setup()
    buildWritingFocus(motion, list)
    expect(created).toHaveLength(2)
    expect(created[0]).toMatchObject({ trigger: row(list), start: 'top bottom', end: 'bottom top' })
  })

  it('the row at the middle of the screen is fully lit; a row far away rests at the floor', () => {
    const { list, created, motion } = setup()
    buildWritingFocus(motion, list)
    // innerHeight 768, row 100 px: its centre crosses mid-screen at progress 0.5.
    created[0].onUpdate?.({ progress: 0.5 })
    expect(title(list)?.style.getPropertyValue('--focus')).toBe('1')
    created[0].onUpdate?.({ progress: 0 })
    expect(title(list)?.style.getPropertyValue('--focus')).toBe('0')
    // CSS maps --focus onto the theme's floor; no inline opacity to go stale.
    expect(title(list)?.style.opacity).toBe('')
  })

  it('thumb scales from 0.82 to 1, from its left edge', () => {
    const { list, created, motion } = setup()
    buildWritingFocus(motion, list)
    expect(thumb(list)?.style.transform).toBe('scale(0.82)')
    expect(thumb(list)?.style.transformOrigin).toBe('0 50%')
    created[0].onUpdate?.({ progress: 0.5 })
    expect(thumb(list)?.style.transform).toBe('scale(1)')
  })

  it('the date never dims', () => {
    const { list, created, motion } = setup()
    buildWritingFocus(motion, list)
    created[0].onUpdate?.({ progress: 0 })
    expect(row(list).querySelector<HTMLElement>('[data-post-date]')?.style.opacity).toBe('')
  })

  it('cleanup kills the triggers and clears the styles', () => {
    const { list, kill, motion } = setup()
    const cleanup = buildWritingFocus(motion, list)
    cleanup()
    expect(kill).toHaveBeenCalledTimes(2)
    expect(title(list)?.style.getPropertyValue('--focus')).toBe('')
    expect(thumb(list)?.style.transform).toBe('')
  })
})
