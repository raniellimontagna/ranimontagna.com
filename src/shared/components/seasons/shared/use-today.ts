'use client'

import { useEffect, useState } from 'react'

/** Today's date that turns at local midnight while the page stays open. */
export function useToday(): Date {
  const [today, setToday] = useState(() => new Date())

  useEffect(() => {
    const midnight = new Date(today)
    midnight.setHours(24, 0, 0, 0)
    const timer = window.setTimeout(() => setToday(new Date()), midnight.getTime() - Date.now())
    return () => window.clearTimeout(timer)
  }, [today])

  return today
}
