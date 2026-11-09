import type { ScrollMotion } from '@/shared/components/motion'
import { buildCountUp, buildStageRise } from '../case-motion'

type Vars = Record<string, unknown> & { scrollTrigger?: Record<string, unknown> }

function fakeMotion() {
  const fromTo = vi.fn((_target: Element, _from: Vars, _to: Vars) => ({ revert: vi.fn() }))
  const to = vi.fn((target: { value: number }, vars: Vars) => {
    const tween = {
      play: vi.fn(() => {
        target.value = vars.value as number
        ;(vars.onUpdate as () => void)()
      }),
      kill: vi.fn(),
    }
    return tween
  })
  const created: Array<Record<string, unknown> & { kill: ReturnType<typeof vi.fn> }> = []
  const ScrollTrigger = {
    create: vi.fn((config: Record<string, unknown>) => {
      const trigger = { ...config, kill: vi.fn() }
      created.push(trigger)
      return trigger
    }),
  }
  return {
    motion: { gsap: { fromTo, to }, ScrollTrigger } as unknown as ScrollMotion,
    fromTo,
    to,
    created,
  }
}

function stage() {
  const root = document.createElement('div')
  root.innerHTML = '<div data-stage-browser></div><div data-stage-phone></div>'
  document.body.appendChild(root)
  return root
}

const placeAt = (element: Element, top: number) => {
  element.getBoundingClientRect = () => ({ top }) as DOMRect
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('buildStageRise', () => {
  it('on desktop lays the browser flat from a tilt and raises the phone, both scrubbed by the stage', () => {
    const { motion, fromTo } = fakeMotion()
    const root = stage()
    buildStageRise(motion, root, 'desktop')
    const [browser, phone] = fromTo.mock.calls
    expect(browser?.[0]).toBe(root.querySelector('[data-stage-browser]'))
    expect(browser?.[1]).toMatchObject({ rotateX: expect.any(Number), scale: expect.any(Number) })
    expect(browser?.[2]).toMatchObject({ rotateX: 0, scale: 1 })
    expect(phone?.[0]).toBe(root.querySelector('[data-stage-phone]'))
    expect(phone?.[1]).toMatchObject({ yPercent: expect.any(Number) })
    expect(phone?.[2]).toMatchObject({ yPercent: 0 })
    for (const call of fromTo.mock.calls) {
      expect(call[2].scrollTrigger).toMatchObject({ trigger: root, scrub: true })
    }
  })

  it('on the phone gives depth instead: the phone climbs faster than the browser behind it', () => {
    const { motion, fromTo } = fakeMotion()
    buildStageRise(motion, stage(), 'mobile')
    const [browser, phone] = fromTo.mock.calls
    expect(browser?.[1]).not.toHaveProperty('rotateX')
    const browserTravel = Math.abs(
      (browser?.[1].yPercent as number) - (browser?.[2].yPercent as number),
    )
    const phoneTravel = Math.abs((phone?.[1].yPercent as number) - (phone?.[2].yPercent as number))
    expect(phoneTravel).toBeGreaterThan(browserTravel)
  })

  it('reverts every tween on cleanup', () => {
    const { motion, fromTo } = fakeMotion()
    const cleanup = buildStageRise(motion, stage(), 'desktop')
    cleanup()
    for (const result of fromTo.mock.results) expect(result.value.revert).toHaveBeenCalled()
  })
})

describe('buildCountUp', () => {
  const format = (value: number) => `n${value}`

  it('starts a number below the fold at zero and counts to the target once it enters', () => {
    const { motion, created } = fakeMotion()
    const element = document.createElement('span')
    placeAt(element, window.innerHeight + 200)
    buildCountUp(motion, element, 428, format)
    expect(element.textContent).toBe('n0')
    expect(created[0]).toMatchObject({ trigger: element, once: true })
    const onEnter = created[0]?.onEnter as (() => void) | undefined
    onEnter?.()
    expect(element.textContent).toBe('n428')
  })

  it('leaves a number already on screen alone', () => {
    const { motion, created } = fakeMotion()
    const element = document.createElement('span')
    element.textContent = 'n428'
    placeAt(element, 10)
    buildCountUp(motion, element, 428, format)
    expect(element.textContent).toBe('n428')
    expect(created).toHaveLength(0)
  })

  it('puts the final number back on cleanup', () => {
    const { motion, created } = fakeMotion()
    const element = document.createElement('span')
    placeAt(element, window.innerHeight + 200)
    const cleanup = buildCountUp(motion, element, 428, format)
    cleanup()
    expect(element.textContent).toBe('n428')
    expect(created[0]?.kill).toHaveBeenCalled()
  })
})
