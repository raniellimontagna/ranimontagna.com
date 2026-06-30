'use client'

import { useEffect, useRef } from 'react'

type GsapModule = typeof import('gsap')
type GsapApi = GsapModule['gsap']
type GsapAnimation = ReturnType<GsapApi['to']>

const LOAD_HOME_SECTIONS_EVENT = 'home-sections:load'
const HOME_SECTIONS_READY_EVENT = 'home-sections:ready'
const LOAD_EVENTS = ['pointerdown', 'touchstart', 'wheel', 'scroll', 'keydown'] as const

function readNumber(element: Element, attribute: string, fallback: number) {
  const value = Number.parseFloat(element.getAttribute(attribute) ?? '')
  return Number.isFinite(value) ? value : fallback
}

function isReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function scheduleIdle(callback: () => void) {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(callback, { timeout: 1200 })
    return () => window.cancelIdleCallback?.(id)
  }

  const id = globalThis.setTimeout(callback, 300)
  return () => globalThis.clearTimeout(id)
}

function track(animation: GsapAnimation | undefined, cleanups: Array<() => void>) {
  if (animation && typeof animation.kill === 'function') {
    cleanups.push(() => animation.kill())
  }
}

function getRevealInitial(element: Element) {
  const direction = element.getAttribute('data-gsap-direction') ?? 'up'
  const distance = readNumber(element, 'data-gsap-distance', 20)
  const initial: Record<string, string | number> = { autoAlpha: 0, x: 0, y: 0 }

  if (direction === 'up') initial.y = distance
  if (direction === 'down') initial.y = -distance
  if (direction === 'left') initial.x = distance
  if (direction === 'right') initial.x = -distance
  if (element.getAttribute('data-gsap-blur') === 'true') initial.filter = 'blur(10px)'
  if (element.getAttribute('data-gsap-scale') === 'true') initial.scale = 0.96

  return initial
}

function getRevealTarget(element: Element) {
  const target: Record<string, string | number | boolean> = {
    autoAlpha: 1,
    x: 0,
    y: 0,
    duration: readNumber(element, 'data-gsap-duration', 0.6),
    delay: readNumber(element, 'data-gsap-delay', 0),
    ease: 'power3.out',
    overwrite: 'auto',
  }

  if (element.getAttribute('data-gsap-blur') === 'true') target.filter = 'blur(0px)'
  if (element.getAttribute('data-gsap-scale') === 'true') target.scale = 1

  return target
}

function isInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < viewportHeight &&
    rect.left < viewportWidth
  )
}

function observeElements(
  selector: string,
  cleanups: Array<() => void>,
  onEnter: (element: HTMLElement, observer: IntersectionObserver) => void,
  onPrepare?: (element: HTMLElement) => void,
) {
  const elements = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => element.dataset.gsapBound !== 'true',
  )

  if (elements.length === 0) return

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        onEnter(entry.target as HTMLElement, observer)
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
  )

  for (const element of elements) {
    element.dataset.gsapBound = 'true'
    if (isInViewport(element)) {
      element.dataset.gsapVisibleAtBind = 'true'
    } else {
      onPrepare?.(element)
    }
    observer.observe(element)
  }

  cleanups.push(() => {
    for (const element of elements) {
      delete element.dataset.gsapBound
      delete element.dataset.gsapVisibleAtBind
    }
    observer.disconnect()
  })
}

function shouldSkipEntrance(element: HTMLElement, observer: IntersectionObserver) {
  if (element.dataset.gsapVisibleAtBind !== 'true') return false

  observer.unobserve(element)
  return true
}

function setupRevealAnimations(gsap: GsapApi, cleanups: Array<() => void>) {
  observeElements(
    '[data-gsap-reveal="true"]',
    cleanups,
    (element, observer) => {
      if (shouldSkipEntrance(element, observer)) return

      element.style.willChange = 'transform, opacity'
      track(gsap.to(element, getRevealTarget(element)), cleanups)

      if (element.getAttribute('data-gsap-once') !== 'false') {
        observer.unobserve(element)
      }
    },
    (element) => {
      element.style.willChange = 'transform, opacity'
      gsap.set(element, getRevealInitial(element))
    },
  )
}

function setupTextAnimations(gsap: GsapApi, cleanups: Array<() => void>) {
  observeElements(
    '[data-gsap-text="true"]',
    cleanups,
    (element, observer) => {
      if (shouldSkipEntrance(element, observer)) return

      const segments = element.querySelectorAll('[data-gsap-text-segment="true"]')
      track(
        gsap.to(segments, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          delay: readNumber(element, 'data-gsap-delay', 0),
          stagger: readNumber(element, 'data-gsap-stagger-delay', 0.045),
          ease: 'power3.out',
          overwrite: 'auto',
        }),
        cleanups,
      )

      if (element.getAttribute('data-gsap-once') !== 'false') {
        observer.unobserve(element)
      }
    },
    (element) => {
      const segments = element.querySelectorAll('[data-gsap-text-segment="true"]')
      gsap.set(segments, { autoAlpha: 0, y: 18 })
    },
  )
}

function setupStaggerAnimations(gsap: GsapApi, cleanups: Array<() => void>) {
  observeElements(
    '[data-gsap-stagger="true"]',
    cleanups,
    (element, observer) => {
      if (shouldSkipEntrance(element, observer)) return

      const items = element.querySelectorAll('[data-gsap-stagger-item="true"]')
      const targets = items.length > 0 ? items : element.children

      track(
        gsap.to(targets, {
          autoAlpha: 1,
          y: 0,
          duration: 0.58,
          stagger: readNumber(element, 'data-gsap-stagger-delay', 0.1),
          ease: 'power3.out',
          overwrite: 'auto',
        }),
        cleanups,
      )

      if (element.getAttribute('data-gsap-once') !== 'false') {
        observer.unobserve(element)
      }
    },
    (element) => {
      const items = element.querySelectorAll('[data-gsap-stagger-item="true"]')
      const targets = items.length > 0 ? items : element.children
      gsap.set(targets, { autoAlpha: 0, y: 22 })
    },
  )
}

function setupCountAnimations(gsap: GsapApi, cleanups: Array<() => void>) {
  observeElements('[data-gsap-count="true"]', cleanups, (element, observer) => {
    if (shouldSkipEntrance(element, observer)) return

    const targetValue = readNumber(element, 'data-gsap-count-value', 0)
    const suffix = element.getAttribute('data-gsap-count-suffix') ?? ''
    const counter = { value: 0 }

    track(
      gsap.to(counter, {
        value: targetValue,
        duration: readNumber(element, 'data-gsap-duration', 1.6),
        delay: readNumber(element, 'data-gsap-delay', 0),
        ease: 'power2.out',
        onUpdate: () => {
          element.textContent = `${String(Math.round(counter.value)).padStart(2, '0')}${suffix}`
        },
      }),
      cleanups,
    )
    observer.unobserve(element)
  })
}

function setupMagneticHover(gsap: GsapApi, cleanups: Array<() => void>) {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-gsap-magnetic="true"]'))

  for (const element of elements) {
    if (element.dataset.gsapMagneticBound === 'true') continue

    element.dataset.gsapMagneticBound = 'true'
    const strength = readNumber(element, 'data-gsap-strength', 18)
    const xTo = gsap.quickTo(element, 'x', { duration: 0.35, ease: 'power3.out' })
    const yTo = gsap.quickTo(element, 'y', { duration: 0.35, ease: 'power3.out' })

    const handlePointerMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * strength
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * strength
      xTo(x)
      yTo(y)
    }

    const reset = () => {
      xTo(0)
      yTo(0)
    }

    element.addEventListener('pointermove', handlePointerMove)
    element.addEventListener('pointerleave', reset)
    cleanups.push(() => {
      delete element.dataset.gsapMagneticBound
      element.removeEventListener('pointermove', handlePointerMove)
      element.removeEventListener('pointerleave', reset)
    })
  }
}

function setupParallaxLayers(gsap: GsapApi, cleanups: Array<() => void>) {
  const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-gsap-parallax="true"]')).filter(
    (element) => element.dataset.gsapParallaxBound !== 'true',
  )

  if (layers.length === 0) return

  for (const element of layers) {
    element.dataset.gsapParallaxBound = 'true'
  }

  const setters = layers.map((element) => ({
    element,
    axis: element.getAttribute('data-gsap-axis') === 'x' ? 'x' : 'y',
    offset: readNumber(element, 'data-gsap-offset', 36),
    set: gsap.quickTo(element, element.getAttribute('data-gsap-axis') === 'x' ? 'x' : 'y', {
      duration: 0.55,
      ease: 'power3.out',
    }),
  }))

  let frame = 0

  const update = () => {
    frame = 0
    const viewportHeight = window.innerHeight || 1

    for (const item of setters) {
      const rect = item.element.getBoundingClientRect()
      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height)
      const clamped = Math.max(0, Math.min(1, progress))
      item.set((clamped - 0.5) * item.offset * -1)
    }
  }

  const requestUpdate = () => {
    if (frame) return
    frame = window.requestAnimationFrame(update)
  }

  window.addEventListener('scroll', requestUpdate, { passive: true })
  window.addEventListener('resize', requestUpdate)
  requestUpdate()

  cleanups.push(() => {
    for (const element of layers) delete element.dataset.gsapParallaxBound
    window.removeEventListener('scroll', requestUpdate)
    window.removeEventListener('resize', requestUpdate)
    if (frame) window.cancelAnimationFrame(frame)
  })
}

function setupAnimations(gsap: GsapApi) {
  const cleanups: Array<() => void> = []
  const context = gsap.context(() => undefined, document.body)

  setupRevealAnimations(gsap, cleanups)
  setupTextAnimations(gsap, cleanups)
  setupStaggerAnimations(gsap, cleanups)
  setupCountAnimations(gsap, cleanups)
  setupMagneticHover(gsap, cleanups)
  setupParallaxLayers(gsap, cleanups)

  if (cleanups.length === 0) {
    context.revert()
    return null
  }

  return () => {
    for (const cleanup of cleanups) cleanup()
    context.revert()
  }
}

export function ProgressiveGsapAnimations() {
  const gsapPromiseRef = useRef<Promise<GsapApi> | null>(null)
  const cleanupsRef = useRef<Array<() => void>>([])
  const idleCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (isReducedMotion()) return

    const loadGsap = () => {
      gsapPromiseRef.current ??= import('gsap').then((module) => module.gsap)
      return gsapPromiseRef.current
    }

    const scheduleSetup = () => {
      idleCleanupRef.current?.()
      idleCleanupRef.current = scheduleIdle(() => {
        void loadGsap().then((gsap) => {
          const cleanup = setupAnimations(gsap)
          if (cleanup) cleanupsRef.current.push(cleanup)
        })
      })
    }

    window.addEventListener(LOAD_HOME_SECTIONS_EVENT, scheduleSetup)
    window.addEventListener(HOME_SECTIONS_READY_EVENT, scheduleSetup)
    for (const eventName of LOAD_EVENTS) {
      window.addEventListener(eventName, scheduleSetup, { once: true, passive: true })
    }

    return () => {
      idleCleanupRef.current?.()
      for (const cleanup of cleanupsRef.current) cleanup()
      cleanupsRef.current = []
      window.removeEventListener(LOAD_HOME_SECTIONS_EVENT, scheduleSetup)
      window.removeEventListener(HOME_SECTIONS_READY_EVENT, scheduleSetup)
      for (const eventName of LOAD_EVENTS) {
        window.removeEventListener(eventName, scheduleSetup)
      }
    }
  }, [])

  return null
}
