import type { ScrollMotion } from '@/shared/components/motion'
import { buildAiRail } from '../ai-rail-motion'

type Config = {
  trigger?: Element
  start?: string
  end?: string
  pin?: boolean
  onUpdate?: (self: { progress: number }) => void
  onRefresh?: () => void
}

function setup() {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = `<div data-ai-rail><span data-ai-rail-fill></span></div><ol>${'<li data-ai-step data-lit="true"></li>'.repeat(6)}</ol>`
  const list = wrapper.querySelector('ol') as HTMLOListElement
  Object.defineProperty(list, 'offsetHeight', { value: 632, configurable: true })
  list.querySelectorAll<HTMLElement>('li').forEach((item, index) => {
    Object.defineProperty(item, 'offsetTop', { value: index * 110, configurable: true })
  })
  document.body.appendChild(wrapper)
  const created: Config[] = []
  const kill = vi.fn()
  const motion = {
    gsap: {},
    ScrollTrigger: {
      create: vi.fn((config: Config) => {
        created.push(config)
        return { kill }
      }),
    },
  } as unknown as ScrollMotion
  return { wrapper, list, created, kill, motion }
}

const lit = (list: HTMLElement) =>
  [...list.querySelectorAll('li')].map((item) => item.getAttribute('data-lit'))

describe('buildAiRail', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('scrubs from the list top at 72% of the screen to its bottom at 72%, without pinning', () => {
    const { list, created, motion } = setup()
    buildAiRail(motion, list)
    expect(created).toHaveLength(1)
    expect(created[0]).toMatchObject({ trigger: list, start: 'top 72%', end: 'bottom 72%' })
    expect(created[0].pin).toBeFalsy()
  })

  it('fills the rail and lights steps whose node it has passed', () => {
    const { wrapper, list, created, motion } = setup()
    buildAiRail(motion, list)
    created[0].onUpdate?.({ progress: 0.5 })
    expect(wrapper.querySelector<HTMLElement>('[data-ai-rail-fill]')?.style.transform).toBe(
      'scaleY(0.5)',
    )
    // Rail from 16 px, 600 px tall: half way is 316 px; nodes sit 22 px into each step.
    expect(lit(list)).toEqual(['true', 'true', 'true', 'false', 'false', 'false'])
  })

  it('lights nothing before the rail starts and everything at the end', () => {
    const { list, created, motion } = setup()
    buildAiRail(motion, list)
    created[0].onUpdate?.({ progress: 0 })
    expect(lit(list)).toEqual(['false', 'false', 'false', 'false', 'false', 'false'])
    created[0].onUpdate?.({ progress: 1 })
    expect(lit(list).every((value) => value === 'true')).toBe(true)
  })

  it('cleanup relights every step and drops the inline fill', () => {
    const { wrapper, list, created, kill, motion } = setup()
    const cleanup = buildAiRail(motion, list)
    created[0].onUpdate?.({ progress: 0.2 })
    cleanup()
    expect(kill).toHaveBeenCalled()
    expect(lit(list).every((value) => value === 'true')).toBe(true)
    expect(wrapper.querySelector<HTMLElement>('[data-ai-rail-fill]')?.style.transform).toBe('')
  })
})
