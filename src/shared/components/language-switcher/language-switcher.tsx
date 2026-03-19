'use client'

import { AltArrowDown, CheckCircle, Global } from '@solar-icons/react/ssr'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { usePathname, useRouter } from '@/shared/config/i18n/navigation'
import { locales } from '@/shared/config/i18n/routing'

const flagMap: Record<string, string> = {
  pt: 'br',
  en: 'us',
  es: 'es',
}

const shortNames: Record<string, string> = {
  pt: 'PT-BR',
  en: 'EN-US',
  es: 'ES',
}

export const LanguageSwitcher = (): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false)
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const switcherRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
    setIsOpen(false)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const currentFlag = flagMap[locale]

  return (
    <div className="relative" ref={switcherRef}>
      <button
        type="button"
        data-testid="language-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-8 items-center gap-1.5 rounded-xl px-2 text-muted transition-all duration-300 hover:bg-surface-strong hover:text-foreground active:scale-95"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative h-4 w-4 overflow-hidden rounded-full ring-1 ring-line transition-all duration-300 group-hover:ring-accent-strong/50">
          <Image
            src={`/flags/${currentFlag}.svg`}
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

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile - using button for accessibility and lint fix */}
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default bg-background/40 backdrop-blur-[2px] md:hidden"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              tabIndex={-1}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="surface-panel absolute top-full right-0 z-50 mt-2 w-52 origin-top-right overflow-hidden rounded-2xl bg-surface-strong shadow-panel backdrop-blur-3xl"
              role="menu"
              aria-orientation="vertical"
            >
              <div className="flex items-center gap-2 border-b border-line bg-surface-strong px-4 py-3">
                <Global className="h-3 w-3 text-muted/60" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted/60">
                  Select Language
                </span>
              </div>

              <div className="p-1.5">
                {locales.map((loc) => {
                  const isSelected = locale === loc.code
                  const flagCode = flagMap[loc.code]

                  return (
                    <button
                      type="button"
                      key={loc.code}
                      onClick={() => handleLocaleChange(loc.code)}
                      role="menuitem"
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                        isSelected
                          ? 'bg-accent/10 text-accent-strong shadow-sm'
                          : 'text-muted hover:bg-surface-strong hover:text-foreground active:scale-[0.98]'
                      }`}
                    >
                      <div
                        className={`relative h-6 w-6 shrink-0 overflow-hidden rounded-full transition-all duration-300 shadow-sm ${
                          isSelected
                            ? 'ring-2 ring-accent'
                            : 'ring-1 ring-line group-hover:ring-muted/50'
                        }`}
                      >
                        <Image
                          src={`/flags/${flagCode}.svg`}
                          alt={`${loc.name} flag`}
                          width={24}
                          height={24}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex-1 text-left">
                        <p className="text-xs font-bold leading-tight">{loc.name}</p>
                        <p className="text-[9px] font-medium opacity-60">{shortNames[loc.code]}</p>
                      </div>

                      {isSelected && <CheckCircle className="h-3.5 w-3.5" />}
                    </button>
                  )
                })}
              </div>

              <div className="bg-surface-strong px-4 py-2 text-center border-t border-line/50">
                <p className="text-[9px] font-medium text-muted/40">Next.js i18n dynamic routing</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
