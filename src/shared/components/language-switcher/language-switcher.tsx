'use client'

import { AltArrowDown, CheckCircle, Global } from '@solar-icons/react/ssr'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from '@/shared/config/i18n/navigation'
import { locales } from '@/shared/config/i18n/routing'

const flagMap: Record<string, string> = { pt: 'br', en: 'us', es: 'es' }
const shortNames: Record<string, string> = { pt: 'PT-BR', en: 'EN-US', es: 'ES' }

export const LanguageSwitcher = (): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false)
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const switcherRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const selectedRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    selectedRef.current?.focus()

    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="relative" ref={switcherRef}>
      <button
        ref={triggerRef}
        type="button"
        data-testid="language-switcher-button"
        onClick={() => setIsOpen((open) => !open)}
        className="group relative flex h-8 items-center gap-1.5 rounded-xl px-2 text-muted transition-all duration-300 hover:bg-surface-strong hover:text-foreground active:scale-95"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-controls="language-picker-options"
      >
        <div className="relative h-4 w-4 overflow-hidden rounded-full ring-1 ring-line transition-all duration-300 group-hover:ring-accent-strong/50">
          <Image
            src={`/flags/${flagMap[locale]}.svg`}
            alt={`${locale} flag`}
            width={16}
            height={16}
            className="h-full w-full object-cover"
          />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest">{locale}</span>
        <AltArrowDown
          className={`h-3 w-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-background/40 backdrop-blur-[2px] md:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            tabIndex={-1}
          />

          <fieldset
            id="language-picker-options"
            className="surface-panel absolute top-full right-0 z-50 mt-2 w-52 origin-top-right overflow-hidden rounded-2xl bg-surface-strong shadow-panel backdrop-blur-3xl"
          >
            <legend className="flex w-full items-center gap-2 border-b border-line bg-surface-strong px-4 py-3">
              <Global className="h-3 w-3 text-muted" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                Select Language
              </span>
            </legend>

            <div className="p-1.5">
              {locales.map((option) => {
                const isSelected = locale === option.code
                return (
                  <label
                    key={option.code}
                    className={`group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 focus-within:outline-3 focus-within:outline-offset-1 focus-within:outline-[var(--focus-ring)] ${
                      isSelected
                        ? 'bg-accent/10 text-accent-strong shadow-sm'
                        : 'text-muted hover:bg-surface-strong hover:text-foreground'
                    }`}
                  >
                    <input
                      ref={isSelected ? selectedRef : undefined}
                      type="radio"
                      name="language"
                      value={option.code}
                      checked={isSelected}
                      onChange={() => handleLocaleChange(option.code)}
                      className="sr-only"
                    />
                    <span
                      className={`relative h-6 w-6 shrink-0 overflow-hidden rounded-full shadow-sm ${isSelected ? 'ring-2 ring-accent' : 'ring-1 ring-line'}`}
                    >
                      <Image
                        src={`/flags/${flagMap[option.code]}.svg`}
                        alt={`${option.name} flag`}
                        width={24}
                        height={24}
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span className="flex-1 text-left">
                      <span className="block text-xs font-bold leading-tight">{option.name}</span>
                      <span className="block text-[9px] font-medium">
                        {shortNames[option.code]}
                      </span>
                    </span>
                    {isSelected ? <CheckCircle aria-hidden="true" className="h-3.5 w-3.5" /> : null}
                  </label>
                )
              })}
            </div>
          </fieldset>
        </>
      ) : null}
    </div>
  )
}
