'use client'

import { type KeyboardEvent, useRef } from 'react'

type ArticleImageProps = { src?: string; alt?: string; zoomLabel: string; closeLabel: string }

/** An inline image that opens full size in a native dialog. */
export function ArticleImage({ src, alt = '', zoomLabel, closeLabel }: ArticleImageProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  if (!src) return null

  const open = () => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
  }
  const close = () => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (typeof dialog.close === 'function') dialog.close()
    dialog.removeAttribute('open')
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape') close()
  }

  return (
    <figure className="my-10">
      <button
        type="button"
        onClick={open}
        aria-label={`${zoomLabel}: ${alt}`}
        className="block w-full cursor-zoom-in"
      >
        {/* biome-ignore lint/performance/noImgElement: remote post media from the content repository. */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full rounded-[2px] border border-line"
        />
      </button>
      {alt ? <figcaption className="mt-3 font-mono text-xs text-muted">{alt}</figcaption> : null}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Escape is handled by onKeyDown; the click closes on the backdrop. */}
      <dialog
        ref={dialogRef}
        aria-label={alt}
        onKeyDown={onKeyDown}
        onClick={close}
        className="m-auto max-h-[92svh] max-w-[94vw] bg-transparent p-0 backdrop:bg-background/90"
      >
        {/* biome-ignore lint/performance/noImgElement: full-size view of the same remote image. */}
        <img src={src} alt="" className="max-h-[88svh] w-auto" />
        <button
          type="button"
          onClick={close}
          className="mt-3 rounded-full border border-line bg-background px-4 py-1.5 text-sm text-foreground"
        >
          {closeLabel}
        </button>
      </dialog>
    </figure>
  )
}
