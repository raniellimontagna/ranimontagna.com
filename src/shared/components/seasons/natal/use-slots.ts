'use client'

import { useEffect, useState } from 'react'
import { usePathname } from '@/shared/config/i18n/navigation'

const same = (a: Element[], b: Element[]) =>
  a.length === b.length && a.every((element, index) => element === b[index])

/**
 * One page observer for every slot lookup: each subscriber re-queries after a DOM
 * change, batched into a single microtask. It disconnects when nobody listens.
 */
const subscribers = new Set<() => void>()
let observer: MutationObserver | null = null
let pending = false

function notify() {
  if (pending) return
  pending = true
  queueMicrotask(() => {
    pending = false
    for (const subscriber of subscribers) subscriber()
  })
}

function subscribe(listener: () => void): () => void {
  subscribers.add(listener)
  if (!observer) {
    observer = new MutationObserver(notify)
    observer.observe(document.body, { childList: true, subtree: true })
  }
  return () => {
    subscribers.delete(listener)
    if (subscribers.size === 0) {
      observer?.disconnect()
      observer = null
    }
  }
}

/**
 * The page's empty season slots matching `selector`. Pages come and go under the
 * layout (client navigation), so slots are looked up again whenever the DOM changes.
 */
export function useSlots(selector: string): Element[] {
  const pathname = usePathname()
  const [slots, setSlots] = useState<Element[]>([])

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new page means new slots.
  useEffect(() => {
    const query = () => {
      const next = Array.from(document.querySelectorAll(selector))
      setSlots((previous) => (same(previous, next) ? previous : next))
    }
    query()
    return subscribe(query)
  }, [selector, pathname])

  return slots
}
