'use client'

import { useEffect, useRef, useState } from 'react'
import { shareSite } from '../shared/share-site'
import { useModalDialog } from '../shared/use-modal-dialog'
import { getProgramadorCopy } from './programador-copy'
import { playBuild } from './programador-sound'

type LgtmCardProps = { open: boolean; onClose: () => void; locale: string }

/** The code review's reward: the approval, with the five fixes and a "build passing" arpeggio. */
export function LgtmCard({ open, onClose, locale }: LgtmCardProps) {
  const copy = getProgramadorCopy(locale)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [copied, setCopied] = useState(false)
  useModalDialog(dialogRef, open)

  useEffect(() => {
    if (!open) return
    setCopied(false)
    return playBuild()
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
      aria-labelledby="programador-card-title"
      className="programador-card-dialog"
      onCancel={(event) => {
        // Esc or the back gesture: the parent owns the open state.
        event.preventDefault()
        onClose()
      }}
    >
      <p className="programador-card-badge" aria-hidden="true">
        ✓ LGTM
      </p>
      <h2 id="programador-card-title" className="programador-card-title">
        {copy.cardTitle}
      </h2>
      <p className="programador-card-body">{copy.cardBody}</p>
      <ol className="programador-card-fixes">
        {copy.prs.map((pr) => (
          <li key={pr.title}>
            <span>{pr.title}</span>
            <code>{pr.fix}</code>
          </li>
        ))}
      </ol>
      <div className="programador-card-actions">
        <button type="button" onClick={share} className="programador-card-button" data-primary>
          {copy.share}
        </button>
        <button type="button" onClick={onClose} className="programador-card-button">
          {copy.close}
        </button>
      </div>
      <p role="status" className="programador-card-copied">
        {copied ? copy.linkCopied : ''}
      </p>
    </dialog>
  )
}
