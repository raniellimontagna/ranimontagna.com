'use client'

import { useEffect, useState } from 'react'
import { usePathname } from '@/shared/config/i18n/navigation'

const same = (a: Element[], b: Element[]) =>
  a.length === b.length && a.every((element, index) => element === b[index])

/**
 * The page's empty season slots matching `selector`. Pages come and go under the
 * layout (client navigation), so slots are looked up again whenever the DOM changes.
 */
export function useSlots(selector: string): Element[] {
  const pathname = usePathname()
  const [slots, setSlots] = useState<Element[]>([])

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new page means new slots.
  useEffect(() => {
    let pending = false
    const query = () => {
      pending = false
      const next = Array.from(document.querySelectorAll(selector))
      setSlots((previous) => (same(previous, next) ? previous : next))
    }
    const schedule = () => {
      if (pending) return
      pending = true
      queueMicrotask(query)
    }

    query()
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [selector, pathname])

  return slots
}
