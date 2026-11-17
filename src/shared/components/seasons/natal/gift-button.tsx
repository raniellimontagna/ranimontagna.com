'use client'

import type { GiftId } from './gift-hunt'
import { GiftIcon } from './natal-icons'

type GiftButtonProps = {
  id: GiftId
  index: number
  opened: boolean
  label: string
  onOpen: (id: GiftId) => void
}

/** One hidden gift: small, quiet, and a real button for keyboard and screen readers. */
export function GiftButton({ id, index, opened, label, onOpen }: GiftButtonProps) {
  return (
    <button
      type="button"
      data-gift={id}
      data-opened={opened || undefined}
      aria-label={label}
      onClick={() => onOpen(id)}
      className="natal-gift"
    >
      <GiftIcon tone={index % 2 ? 'green' : 'red'} />
    </button>
  )
}
