'use client'

import { useEffect, useRef, useState } from 'react'
import { fill } from '../shared/fill'
import { shareSite } from '../shared/share-site'
import { useModalDialog } from '../shared/use-modal-dialog'
import { getReveillonCopy } from './reveillon-copy'
import { SparkIcon } from './reveillon-icons'
import { playAuldLangSyne } from './reveillon-sound'

type WishesCardProps = { open: boolean; onClose: () => void; locale: string; edition: number }

/** The game's reward: a New Year card with the seven wishes and a way to share it. */
export function WishesCard({ open, onClose, locale, edition }: WishesCardProps) {
  const copy = getReveillonCopy(locale)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [copied, setCopied] = useState(false)
  const year = edition + 1
  useModalDialog(dialogRef, open)

  useEffect(() => {
    if (!open) return
    setCopied(false)
    const stop = playAuldLangSyne()
    return stop
  }, [open])

  const share = async () => {
    const result = await shareSite({
      locale,
      title: fill(copy.cardTitle, { year }),
      text: fill(copy.shareText, { year }),
    })
    if (result === 'copied') setCopied(true)
  }

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="reveillon-card-title"
      className="reveillon-card-dialog"
      onCancel={(event) => {
        // Esc or the back gesture: the parent owns the open state.
        event.preventDefault()
        onClose()
      }}
    >
      <p className="reveillon-card-year" aria-hidden="true">
        {year}
      </p>
      <h2 id="reveillon-card-title" className="reveillon-card-title">
        {fill(copy.cardTitle, { year })}
      </h2>
      <p className="reveillon-card-body">{fill(copy.cardBody, { year })}</p>
      <ol className="reveillon-card-wishes">
        {copy.wishes.map((wish) => (
          <li key={wish}>
            <SparkIcon />
            {wish}
          </li>
        ))}
      </ol>
      <div className="reveillon-card-actions">
        <button type="button" onClick={share} className="reveillon-card-button" data-primary>
          {copy.share}
        </button>
        <button type="button" onClick={onClose} className="reveillon-card-button">
          {copy.close}
        </button>
      </div>
      <p role="status" className="reveillon-card-copied">
        {copied ? copy.linkCopied : ''}
      </p>
    </dialog>
  )
}
