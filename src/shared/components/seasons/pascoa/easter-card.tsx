'use client'

import { useEffect, useRef, useState } from 'react'
import { shareSite } from '../shared/share-site'
import { useModalDialog } from '../shared/use-modal-dialog'
import { getPascoaCopy } from './pascoa-copy'
import { playChimes } from './pascoa-sound'

type EasterCardProps = { open: boolean; onClose: () => void; locale: string }

/** A big chocolate egg whose halves part to show a gold star. */
function ChocolateEgg({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 200 220" role="img" aria-label={label} className="pascoa-choco">
      <title>{label}</title>
      <path
        d="M100 92l9 24 26 2-20 16 7 25-22-14-22 14 7-25-20-16 26-2z"
        fill="#e2b33c"
        className="pascoa-choco-star"
      />
      <g className="pascoa-choco-top">
        <path d="M100 10C62 10 34 64 34 104l14-10 13 12 13-12 13 12 13-12 13 12 13-12 13 12 14-10C166 64 138 10 100 10Z" />
        <path d="M58 52c10-18 24-28 42-30" className="pascoa-choco-shine" />
      </g>
      <g className="pascoa-choco-bottom">
        <path d="M34 112c0 50 30 96 66 96s66-46 66-96l-14 10-13-12-13 12-13-12-13 12-13-12-13 12-13-12-13 12Z" />
        <path d="M60 140h80M54 162h92" className="pascoa-choco-ribbon" />
      </g>
    </svg>
  )
}

/** The hunt's reward: the chocolate egg cracks open with an Easter card to share. */
export function EasterCard({ open, onClose, locale }: EasterCardProps) {
  const copy = getPascoaCopy(locale)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [copied, setCopied] = useState(false)
  useModalDialog(dialogRef, open)

  useEffect(() => {
    if (!open) return
    setCopied(false)
    return playChimes()
  }, [open])

  const share = async () => {
    const result = await shareSite({
      locale,
      title: copy.cardTitle,
      text: copy.shareText,
      copyText: true,
    })
    if (result === 'copied') setCopied(true)
  }

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="pascoa-card-title"
      className="pascoa-card-dialog"
      onCancel={(event) => {
        // Esc or the back gesture: the parent owns the open state.
        event.preventDefault()
        onClose()
      }}
    >
      <ChocolateEgg label={copy.eggLabel} />
      <h2 id="pascoa-card-title" className="pascoa-card-title">
        {copy.cardTitle}
      </h2>
      <p className="pascoa-card-body">{copy.cardBody}</p>
      <div className="pascoa-card-actions">
        <button type="button" onClick={share} className="pascoa-card-button" data-primary>
          {copy.share}
        </button>
        <button type="button" onClick={onClose} className="pascoa-card-button">
          {copy.close}
        </button>
      </div>
      <p role="status" className="pascoa-card-copied">
        {copied ? copy.linkCopied : ''}
      </p>
    </dialog>
  )
}
