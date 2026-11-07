import type { ScrollMotion } from '@/shared/components/motion'

/**
 * Desktop only: pins the section and slides the track sideways for exactly its
 * overflow, while each card's media settles from 0.86 to full size.
 */
export function buildLiveTrack({ gsap }: ScrollMotion, section: HTMLElement, track: HTMLElement) {
  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)

  const slide = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  })

  for (const media of track.querySelectorAll('[data-live-media]')) {
    gsap.fromTo(
      media,
      { scale: 0.86 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: media,
          containerAnimation: slide,
          start: 'left right',
          end: 'center center',
          scrub: true,
        },
      },
    )
  }

  return slide
}
