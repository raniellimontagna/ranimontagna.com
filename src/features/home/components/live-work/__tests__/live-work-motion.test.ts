import type { ScrollMotion } from '@/shared/components/motion'
import { buildLiveTrack } from '../live-work-motion'

it('pins the section for exactly the track overflow and settles each card', () => {
  const tween = { kill: vi.fn() }
  const gsap = { to: vi.fn(() => tween), fromTo: vi.fn() }
  const section = document.createElement('section')
  const track = document.createElement('ul')
  track.innerHTML = '<li><div data-live-media></div></li><li><div data-live-media></div></li>'
  Object.defineProperty(track, 'scrollWidth', { value: 3000 })
  Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true })

  buildLiveTrack({ gsap, ScrollTrigger: {} } as unknown as ScrollMotion, section, track)

  const [, vars] = gsap.to.mock.calls[0] as unknown as [
    unknown,
    { x: () => number; scrollTrigger: Record<string, unknown> },
  ]
  expect(vars.x()).toBe(-1560)
  expect(vars.scrollTrigger).toMatchObject({ trigger: section, pin: true })
  expect((vars.scrollTrigger.end as () => string)()).toBe('+=1560')
  expect(gsap.fromTo).toHaveBeenCalledTimes(2)
  expect((gsap.fromTo.mock.calls[0] as unknown[])[2]).toMatchObject({
    scrollTrigger: expect.objectContaining({ containerAnimation: tween }),
  })
})
