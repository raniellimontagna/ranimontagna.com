'use client'

import { useLocale } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from '@/shared/config/i18n/navigation'
import { COLOR_THEMES } from '@/shared/store/use-theme/color-themes'
import { useTheme } from '@/shared/store/use-theme/use-theme'
import { LOCALES } from './site-nav'

type PreferencesLabels = {
  open: string
  language: string
  theme: string
  light: string
  dark: string
  accent: string
}

export function PreferencesMenu({ labels }: { labels: PreferencesLabels }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const { theme, colorTheme, setTheme, setColorTheme } = useTheme()

  useEffect(() => {
    useTheme.getState().initTheme()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  const option =
    'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors aria-pressed:border-foreground aria-pressed:text-foreground border-line text-muted hover:text-foreground'

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-label={labels.open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 items-center gap-2 rounded-full border border-line px-3 font-mono text-xs text-foreground uppercase transition-colors hover:border-foreground"
      >
        {locale}
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-accent" />
      </button>

      {open ? (
        <div className="absolute top-12 right-0 z-50 flex w-72 flex-col gap-5 rounded-2xl border border-line bg-background p-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-mono text-xs tracking-[0.2em] text-muted uppercase">
              {labels.language}
            </legend>
            <div className="flex flex-wrap gap-2">
              {LOCALES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={item.id === locale}
                  className={option}
                  onClick={() => {
                    router.replace(`${pathname}${window.location.hash}`, { locale: item.id })
                    setOpen(false)
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-mono text-xs tracking-[0.2em] text-muted uppercase">
              {labels.theme}
            </legend>
            <div className="flex gap-2">
              <button
                type="button"
                aria-pressed={theme === 'dark'}
                className={option}
                onClick={() => setTheme('dark')}
              >
                {labels.dark}
              </button>
              <button
                type="button"
                aria-pressed={theme === 'light'}
                className={option}
                onClick={() => setTheme('light')}
              >
                {labels.light}
              </button>
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-mono text-xs tracking-[0.2em] text-muted uppercase">
              {labels.accent}
            </legend>
            <div className="grid grid-cols-9 gap-1.5">
              {COLOR_THEMES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  aria-pressed={item.id === colorTheme}
                  title={item.label}
                  onClick={() => setColorTheme(item.id)}
                  style={{ backgroundColor: theme === 'dark' ? item.swatchDark : item.swatch }}
                  className="h-6 w-6 rounded-full border-2 border-transparent transition-transform hover:scale-110 aria-pressed:border-foreground"
                />
              ))}
            </div>
          </fieldset>
        </div>
      ) : null}
    </div>
  )
}
