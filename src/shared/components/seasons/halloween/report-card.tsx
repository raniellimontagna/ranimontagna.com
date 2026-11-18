'use client'

import { useEffect, useRef, useState } from 'react'
import { shareSite } from '../shared/share-site'
import { useModalDialog } from '../shared/use-modal-dialog'
import { getHalloweenCopy } from './halloween-copy'
import { PumpkinIcon } from './halloween-icons'
import { playCackle } from './halloween-sound'

type ReportCardProps = { open: boolean; onClose: () => void; locale: string }

/** The bug hunt's reward: a build report with zero bugs, and a cackle. */
export function ReportCard({ open, onClose, locale }: ReportCardProps) {
  const copy = getHalloweenCopy(locale)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [copied, setCopied] = useState(false)
  useModalDialog(dialogRef, open)

  useEffect(() => {
    if (!open) return
    setCopied(false)
    return playCackle()
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
      aria-labelledby="halloween-card-title"
      className="halloween-card-dialog"
      onCancel={(event) => {
        // Esc or the back gesture: the parent owns the open state.
        event.preventDefault()
        onClose()
      }}
    >
      <PumpkinIcon />
      <h2 id="halloween-card-title" className="halloween-card-title">
        {copy.cardTitle}
      </h2>
      <ul className="halloween-card-report">
        {copy.report.map((line) => (
          <li key={line}>
            <span aria-hidden="true">✓</span> {line}
          </li>
        ))}
      </ul>
      <p className="halloween-card-body">{copy.cardBody}</p>
      <div className="halloween-card-actions">
        <button type="button" onClick={share} className="halloween-card-button" data-primary>
          {copy.share}
        </button>
        <button type="button" onClick={onClose} className="halloween-card-button">
          {copy.close}
        </button>
      </div>
      <p role="status" className="halloween-card-copied">
        {copied ? copy.linkCopied : ''}
      </p>
    </dialog>
  )
}
