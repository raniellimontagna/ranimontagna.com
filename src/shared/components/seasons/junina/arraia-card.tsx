'use client'

import { useEffect, useRef, useState } from 'react'
import { shareSite } from '../shared/share-site'
import { useModalDialog } from '../shared/use-modal-dialog'
import { getJuninaCopy } from './junina-copy'
import { playForro } from './junina-sound'

type ArraiaCardProps = { open: boolean; onClose: () => void; locale: string }

/** The fishing game's reward: the prizes on a festival card, with a forró phrase. */
export function ArraiaCard({ open, onClose, locale }: ArraiaCardProps) {
  const copy = getJuninaCopy(locale)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [copied, setCopied] = useState(false)
  useModalDialog(dialogRef, open)

  useEffect(() => {
    if (!open) return
    setCopied(false)
    return playForro()
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
      aria-labelledby="junina-card-title"
      className="junina-card-dialog"
      onCancel={(event) => {
        // Esc or the back gesture: the parent owns the open state.
        event.preventDefault()
        onClose()
      }}
    >
      <div className="junina-card-bunting" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className="junina-card-flag"
            data-color={['red', 'yellow', 'blue', 'green', 'fire'][i % 5]}
          />
        ))}
      </div>
      <h2 id="junina-card-title" className="junina-card-title">
        {copy.cardTitle}
      </h2>
      <p className="junina-card-body">{copy.cardBody}</p>
      <ul className="junina-card-prizes">
        {copy.prizes.map((prize) => (
          <li key={prize.name}>
            <strong>{prize.name}</strong> · {prize.line}
          </li>
        ))}
      </ul>
      <div className="junina-card-actions">
        <button type="button" onClick={share} className="junina-card-button" data-primary>
          {copy.share}
        </button>
        <button type="button" onClick={onClose} className="junina-card-button">
          {copy.close}
        </button>
      </div>
      <p role="status" className="junina-card-copied">
        {copied ? copy.linkCopied : ''}
      </p>
    </dialog>
  )
}
