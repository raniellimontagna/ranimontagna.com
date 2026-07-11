'use client'

import { useEffect } from 'react'

const STAGE_SELECTOR = '[data-experience-cylinder-stage="true"]'
const DESKTOP_QUERY = '(min-width: 1024px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const PANEL_MOTION_TARGETS = [
  '[data-experience-panel-mark="true"]',
  '[data-experience-panel-heading="true"]',
  '[data-experience-panel-meta="true"]',
  '[data-experience-panel-body="true"]',
  '[data-experience-panel-highlight="true"]',
  '[data-experience-panel-tech="true"]',
]

type ScrollProgressTrigger = {
  end: number
  start: number
}

function toArray<T extends Element>(root: ParentNode, selector: string) {
  return Array.from(root.querySelectorAll<T>(selector))
}

function panelMotionTargets(panel: HTMLElement) {
  return PANEL_MOTION_TARGETS.flatMap((selector) => toArray<HTMLElement>(panel, selector))
}

function supportsMediaListener(query: MediaQueryList) {
  return typeof query.addEventListener === 'function'
}

export function ExperienceCylinderScroll() {
  useEffect(() => {
    const desktopQuery = window.matchMedia(DESKTOP_QUERY)
    const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY)
    let teardown: (() => void) | null = null
    let setupRequested = false
    let isDisposed = false

    const runTeardown = () => {
      teardown?.()
      teardown = null
      setupRequested = false
    }

    const setup = async () => {
      if (teardown || setupRequested || isDisposed) return
      if (!desktopQuery.matches || reducedMotionQuery.matches) {
        runTeardown()
        return
      }

      setupRequested = true
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])

      if (isDisposed || !desktopQuery.matches || reducedMotionQuery.matches) {
        setupRequested = false
        return
      }

      gsap.registerPlugin(ScrollTrigger)

      const stage = document.querySelector<HTMLElement>(STAGE_SELECTOR)
      const cylinder = stage?.querySelector<HTMLElement>('[data-experience-cylinder="true"]')
      const panels = stage ? toArray<HTMLElement>(stage, '[data-experience-panel="true"]') : []
      const cards = stage
        ? toArray<HTMLElement>(stage, '[data-experience-cylinder-card="true"]')
        : []
      const controls = stage
        ? toArray<HTMLButtonElement>(stage, '[data-experience-control="true"]')
        : []
      const pinRoot = stage?.closest<HTMLElement>('.deferred-section')
      const pinRootContentVisibility = pinRoot?.style.getPropertyValue('content-visibility') ?? ''
      const pinRootContainIntrinsicSize =
        pinRoot?.style.getPropertyValue('contain-intrinsic-size') ?? ''
      let scrollTriggerInstance: ScrollProgressTrigger | null = null
      let activePanelIndex = 0
      let refreshFrame = 0

      if (!stage || !cylinder || panels.length === 0 || cards.length === 0) {
        setupRequested = false
        return
      }

      const restorePinRootStyle = () => {
        if (!pinRoot) return

        if (pinRootContentVisibility) {
          pinRoot.style.setProperty('content-visibility', pinRootContentVisibility)
        } else {
          pinRoot.style.removeProperty('content-visibility')
        }

        if (pinRootContainIntrinsicSize) {
          pinRoot.style.setProperty('contain-intrinsic-size', pinRootContainIntrinsicSize)
        } else {
          pinRoot.style.removeProperty('contain-intrinsic-size')
        }
      }

      const animatePanelIn = (panel: HTMLElement) => {
        const targets = panelMotionTargets(panel)
        if (targets.length === 0) return

        gsap.fromTo(
          targets,
          { autoAlpha: 0, scale: 0.99, y: 16 },
          {
            autoAlpha: 1,
            clearProps: 'opacity,visibility,transform',
            duration: 0.48,
            ease: 'power3.out',
            overwrite: 'auto',
            scale: 1,
            stagger: 0.045,
            y: 0,
          },
        )
      }

      const setActive = (nextIndex: number, shouldAnimate = true) => {
        const activeIndex = Math.max(0, Math.min(panels.length - 1, nextIndex))
        const shouldRunPanelMotion = shouldAnimate && activeIndex !== activePanelIndex

        panels.forEach((panel, index) => {
          const isActive = index === activeIndex
          panel.dataset.active = String(isActive)
          if (isActive) {
            panel.removeAttribute('aria-hidden')
          } else {
            panel.setAttribute('aria-hidden', 'true')
          }
        })
        cards.forEach((card, index) => {
          card.dataset.active = String(index === activeIndex)
        })
        controls.forEach((control, index) => {
          const isActive = index === activeIndex
          control.dataset.active = String(isActive)
          control.setAttribute('aria-pressed', String(isActive))
        })

        if (shouldRunPanelMotion) {
          const panel = panels[activeIndex]
          if (panel) animatePanelIn(panel)
        }

        activePanelIndex = activeIndex
      }

      const handleControlClick = (event: Event) => {
        const index = Number.parseInt(
          (event.currentTarget as HTMLElement).dataset.experienceIndex ?? '0',
          10,
        )
        const activeIndex = Number.isFinite(index) ? index : 0
        setActive(activeIndex)

        if (!scrollTriggerInstance || panels.length <= 1) return

        const progress = activeIndex / (panels.length - 1)
        const scrollTop =
          scrollTriggerInstance.start +
          (scrollTriggerInstance.end - scrollTriggerInstance.start) * progress

        window.scrollTo({ behavior: 'smooth', top: scrollTop })
      }

      stage.dataset.experienceEnhanced = 'true'
      pinRoot?.style.setProperty('content-visibility', 'visible')
      pinRoot?.style.setProperty('contain-intrinsic-size', 'none')
      setActive(0, false)

      controls.forEach((control) => {
        control.addEventListener('click', handleControlClick)
      })

      const context = gsap.context(() => {
        gsap.set(cylinder, {
          rotateY: 0,
          transformPerspective: 1100,
          transformStyle: 'preserve-3d',
        })

        const rotationStep = 360 / panels.length
        const totalRotation = -rotationStep * (panels.length - 1)
        const pinOffset = () => (window.innerWidth >= 1280 ? 112 : 96)
        const pinDistance = () =>
          Math.round(Math.max(window.innerHeight * 1.45, panels.length * 440))

        const cylinderTween = gsap.to(cylinder, {
          rotateY: totalRotation,
          ease: 'none',
          paused: true,
        })

        scrollTriggerInstance = ScrollTrigger.create({
          trigger: stage,
          start: () => `top ${pinOffset()}px`,
          end: () => `+=${pinDistance()}`,
          animation: cylinderTween,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.7,
          invalidateOnRefresh: true,
          refreshPriority: 1,
          onUpdate: (self) => {
            setActive(Math.round(self.progress * (panels.length - 1)))
          },
        })

        refreshFrame = window.requestAnimationFrame(() => {
          ScrollTrigger.refresh()
        })
      }, stage)

      teardown = () => {
        if (refreshFrame) {
          window.cancelAnimationFrame(refreshFrame)
          refreshFrame = 0
        }
        controls.forEach((control) => {
          control.removeEventListener('click', handleControlClick)
          control.removeAttribute('aria-pressed')
          delete control.dataset.active
        })
        cards.forEach((card) => {
          delete card.dataset.active
        })
        panels.forEach((panel) => {
          delete panel.dataset.active
          panel.removeAttribute('aria-hidden')
        })
        delete stage.dataset.experienceEnhanced
        scrollTriggerInstance = null
        context.revert()
        restorePinRootStyle()
      }
      setupRequested = false
    }

    const sync = () => {
      if (!desktopQuery.matches || reducedMotionQuery.matches) {
        runTeardown()
        return
      }

      void setup()
    }

    sync()

    if (supportsMediaListener(desktopQuery)) {
      desktopQuery.addEventListener('change', sync)
      reducedMotionQuery.addEventListener('change', sync)
    } else {
      desktopQuery.addListener(sync)
      reducedMotionQuery.addListener(sync)
    }

    return () => {
      isDisposed = true
      runTeardown()

      if (supportsMediaListener(desktopQuery)) {
        desktopQuery.removeEventListener('change', sync)
        reducedMotionQuery.removeEventListener('change', sync)
      } else {
        desktopQuery.removeListener(sync)
        reducedMotionQuery.removeListener(sync)
      }
    }
  }, [])

  return null
}
