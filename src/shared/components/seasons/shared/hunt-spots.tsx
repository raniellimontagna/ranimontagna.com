'use client'

import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { asHuntSpot, HUNT_SPOTS, type HuntSpot } from './hunt'
import { useSlots } from './use-slots'

/** Puts one item of the hunt in every hunt spot on the page. */
export function HuntSpots({ render }: { render: (id: HuntSpot, index: number) => ReactNode }) {
  const slots = useSlots('[data-season-gift]')

  return (
    <>
      {slots.map((slot) => {
        const id = asHuntSpot(slot.getAttribute('data-season-gift'))
        return id ? createPortal(render(id, HUNT_SPOTS.indexOf(id)), slot, id) : null
      })}
    </>
  )
}
