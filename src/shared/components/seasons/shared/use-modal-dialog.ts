'use client'

import { type RefObject, useLayoutEffect, useRef } from 'react'
import { startSmoothScroll, stopSmoothScroll } from '@/shared/components/motion'

/**
 * Shows a <dialog> as a native modal while `open`: the browser makes the page inert,
 * keeps focus inside, closes on Esc or the back gesture and gives focus back. Smooth
 * scroll pauses meanwhile (Lenis scrolls from wheel events, which an inert page still
 * gets). Returns whether the dialog is open now, for callbacks that outlive it.
 */
export function useModalDialog(
  ref: RefObject<HTMLDialogElement | null>,
  open: boolean,
): RefObject<boolean> {
  const openRef = useRef(false)

  // Before paint and before the node leaves: closing first lets the browser return focus.
  useLayoutEffect(() => {
    const dialog = ref.current
    if (!open || !dialog) return
    openRef.current = true
    if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal()
    stopSmoothScroll()
    return () => {
      openRef.current = false
      if (typeof dialog.close === 'function' && dialog.open) dialog.close()
      startSmoothScroll()
    }
  }, [open, ref])

  return openRef
}
