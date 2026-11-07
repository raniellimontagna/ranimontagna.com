'use client'

import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { Link } from '@/shared/config/i18n/navigation'
import { socialLinks } from '@/shared/lib/social-links'
import { SITE_NAV, type SiteNavId } from './site-nav'

type SiteMenuLabels = {
  open: string
  close: string
  title: string
  socials: string
  items: Record<SiteNavId, string>
}

const SOCIALS = [
  socialLinks.linkedin,
  socialLinks.instagram,
  socialLinks.twitter,
  socialLinks.github,
]

/**
 * The site menu at every size: the navigation on phones, and where the social
 * links live on desktop. Full screen, focus trapped, Esc closes.
 */
export function SiteMenu({ labels }: { labels: SiteMenuLabels }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    dialogRef.current?.querySelector<HTMLElement>('a, button')?.focus()
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      root.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) return
    const focusables = dialogRef.current.querySelectorAll<HTMLElement>('a, button')
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="flex h-10 items-center rounded-full border border-line px-4 text-sm font-semibold text-foreground transition-colors hover:border-foreground"
      >
        {labels.open}
      </button>

      {open ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={labels.title}
          data-lenis-prevent
          onKeyDown={trapFocus}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background px-4 pt-6 pb-10 sm:px-8 lg:px-12"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
              {labels.title}
            </span>
            <button
              type="button"
              onClick={close}
              className="flex h-10 items-center rounded-full border border-line px-4 text-sm font-semibold text-foreground hover:border-foreground"
            >
              {labels.close}
            </button>
          </div>

          <nav className="mt-12 flex-1">
            <ul className="flex flex-col gap-2">
              {SITE_NAV.map((item, index) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-baseline gap-4 text-[clamp(40px,9vw,96px)] leading-none font-semibold tracking-[-0.04em] text-foreground"
                  >
                    <span aria-hidden="true" className="font-mono text-sm text-muted">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="transition-transform duration-300 group-hover:translate-x-2">
                      {labels.items[item.id]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 flex flex-col gap-4">
            <span className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
              {labels.socials}
            </span>
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {SOCIALS.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-foreground underline decoration-line underline-offset-[6px] hover:decoration-accent"
                  >
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  )
}
