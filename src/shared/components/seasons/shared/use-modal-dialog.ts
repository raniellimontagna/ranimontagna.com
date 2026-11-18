'use client'

import { type RefObject, useLayoutEffect, useRef } from 'react'
import { startSmoothScroll, stopSmoothScroll } from '@/shared/components/motion'

/**
 * Shows a <dialog> as a native modal while `open`: the browser makes the page inert,
 * keeps focus inside and closes on Esc or the back gesture. Focus goes back to whatever
 * had it before: the season cards unmount their <dialog> on close, and React removes it
 * from the DOM before this cleanup runs, so the browser would not restore it. Smooth
 * scroll pauses meanwhile (Lenis scrolls from wheel events, which an inert page still
 * gets). Returns whether the dialog is open now, for callbacks that outlive it.
 */
export function useModalDialog(
  ref: RefObject<HTMLDialogElement | null>,
  open: boolean,
): RefObject<boolean> {
  const openRef = useRef(false)

  useLayoutEffect(() => {
    const dialog = ref.current
    if (!open || !dialog) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    openRef.current = true
    if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal()
    stopSmoothScroll()
    return () => {
      openRef.current = false
      if (typeof dialog.close === 'function' && dialog.open) dialog.close()
      startSmoothScroll()
      if (opener?.isConnected) opener.focus()
    }
  }, [open, ref])

  return openRef
}
