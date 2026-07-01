'use client'

import { useEffect } from 'react'

const CAROUSEL_SELECTOR = '[data-experience-mobile-carousel="true"]'
const VIEWPORT_SELECTOR = '[data-experience-mobile-gesture-zone="true"]'
const INPUT_SELECTOR = '[data-experience-mobile-input]'
const ACTIVE_TARGET_SELECTOR =
  '[data-experience-mobile-slide="true"], [data-experience-mobile-dot="true"], [data-experience-mobile-arrow]'
const MOBILE_QUERY = '(max-width: 1023px)'
const SWIPE_THRESHOLD = 48
const SWIPE_AXIS_RATIO = 1.15

function supportsMediaListener(query: MediaQueryList) {
  return typeof query.addEventListener === 'function'
}

function toIndex(element: Element) {
  const index = Number.parseInt(element.getAttribute('data-experience-index') ?? '', 10)
  return Number.isFinite(index) ? index : -1
}

function wrapIndex(index: number, length: number) {
  return (index + length) % length
}

export function ExperienceMobileCarouselGestures() {
  useEffect(() => {
    const mobileQuery = window.matchMedia?.(MOBILE_QUERY)
    const carousel = document.querySelector<HTMLElement>(CAROUSEL_SELECTOR)
    const viewport = carousel?.querySelector<HTMLElement>(VIEWPORT_SELECTOR)

    if (!carousel || !viewport) return

    let startX = 0
    let startY = 0
    let isDragging = false

    const inputs = () => Array.from(carousel.querySelectorAll<HTMLInputElement>(INPUT_SELECTOR))
    const isMobile = () => mobileQuery?.matches ?? true

    const getActiveIndex = () => {
      const currentInputs = inputs()
      const activeIndex = currentInputs.findIndex((input) => input.checked)
      return activeIndex >= 0 ? activeIndex : 0
    }

    const syncActiveTargets = (activeIndex = getActiveIndex()) => {
      carousel.dataset.experienceMobileActiveIndex = String(activeIndex)

      for (const input of inputs()) {
        const inputIndex = Number.parseInt(input.dataset.experienceMobileInput ?? '', 10)
        input.checked = inputIndex === activeIndex
      }

      for (const target of carousel.querySelectorAll<HTMLElement>(ACTIVE_TARGET_SELECTOR)) {
        target.dataset.active = String(toIndex(target) === activeIndex)
      }
    }

    const selectIndex = (nextIndex: number, direction: 'next' | 'previous') => {
      const currentInputs = inputs()
      if (currentInputs.length === 0) return

      const activeIndex = wrapIndex(nextIndex, currentInputs.length)
      const activeInput = currentInputs[activeIndex]
      if (!activeInput) return

      carousel.dataset.experienceMobileSwipeDirection = direction
      syncActiveTargets(activeIndex)
      activeInput.dispatchEvent(new Event('input', { bubbles: true }))
      activeInput.dispatchEvent(new Event('change', { bubbles: true }))
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!isMobile()) return
      if (event.pointerType === 'mouse' && event.button !== 0) return

      startX = event.clientX
      startY = event.clientY
      isDragging = true
      viewport.dataset.experienceMobileDragging = 'true'
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (!isDragging) return

      isDragging = false
      delete viewport.dataset.experienceMobileDragging

      const deltaX = event.clientX - startX
      const deltaY = event.clientY - startY
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      if (absX < SWIPE_THRESHOLD || absX < absY * SWIPE_AXIS_RATIO) return

      const direction = deltaX < 0 ? 'next' : 'previous'
      selectIndex(getActiveIndex() + (direction === 'next' ? 1 : -1), direction)
    }

    const handlePointerCancel = () => {
      isDragging = false
      delete viewport.dataset.experienceMobileDragging
    }

    const handleInputChange = () => {
      syncActiveTargets()
    }

    const handleMediaChange = () => {
      if (!isMobile()) {
        delete viewport.dataset.experienceMobileDragging
      }
      syncActiveTargets()
    }

    syncActiveTargets()
    viewport.addEventListener('pointerdown', handlePointerDown)
    viewport.addEventListener('pointerup', handlePointerUp)
    viewport.addEventListener('pointercancel', handlePointerCancel)
    viewport.addEventListener('lostpointercapture', handlePointerCancel)

    for (const input of inputs()) {
      input.addEventListener('change', handleInputChange)
    }

    if (mobileQuery) {
      if (supportsMediaListener(mobileQuery)) {
        mobileQuery.addEventListener('change', handleMediaChange)
      } else {
        mobileQuery.addListener(handleMediaChange)
      }
    }

    return () => {
      viewport.removeEventListener('pointerdown', handlePointerDown)
      viewport.removeEventListener('pointerup', handlePointerUp)
      viewport.removeEventListener('pointercancel', handlePointerCancel)
      viewport.removeEventListener('lostpointercapture', handlePointerCancel)

      for (const input of inputs()) {
        input.removeEventListener('change', handleInputChange)
      }

      if (mobileQuery) {
        if (supportsMediaListener(mobileQuery)) {
          mobileQuery.removeEventListener('change', handleMediaChange)
        } else {
          mobileQuery.removeListener(handleMediaChange)
        }
      }
    }
  }, [])

  return null
}
