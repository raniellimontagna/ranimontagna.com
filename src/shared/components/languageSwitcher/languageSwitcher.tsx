'use client'

import { CheckCircle, Global } from '@solar-icons/react/ssr'
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

export function LanguageSwitcher() {
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
        className="group relative rounded-lg p-2 text-slate-600 transition-all duration-300 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative h-5 w-5 overflow-hidden rounded-full ring-1 ring-slate-200 transition-all duration-200 group-hover:ring-slate-300 group-hover:shadow-sm dark:ring-slate-700 dark:group-hover:ring-slate-600">
          <Image
            src={`/flags/${currentFlag}.svg`}
            alt={`${locale} flag`}
            width={20}
            height={20}
            className="h-full w-full object-cover"
          />
        </div>
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="Close language menu"
          />

          <div
            className="absolute top-full right-0 z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700/80 dark:bg-slate-900"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
              <Global className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Language
              </span>
            </div>

            <div className="p-2">
              {locales.map((loc, index) => {
                const isSelected = locale === loc.code
                const flagCode = flagMap[loc.code]

                return (
                  <button
                    type="button"
                    aria-label={`Change language to ${loc.name}`}
                    data-testid={`language-option-${loc.code}`}
                    key={loc.code}
                    onClick={() => handleLocaleChange(loc.code)}
                    role="menuitem"
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                      isSelected
                        ? 'bg-linear-to-r from-slate-900 to-slate-800 text-white shadow-lg dark:from-white dark:to-slate-100 dark:text-slate-900'
                        : 'text-slate-700 hover:bg-slate-100 active:scale-[0.98] dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <div
                      className={`relative h-8 w-8 shrink-0 overflow-hidden rounded-full transition-all duration-300 ${
                        isSelected
                          ? 'ring-2 ring-white/30 shadow-lg dark:ring-slate-900/30'
                          : 'ring-2 ring-slate-200/50 group-hover:ring-slate-300 group-hover:shadow-md dark:ring-slate-700/50 dark:group-hover:ring-slate-600'
                      }`}
                    >
                      <Image
                        src={`/flags/${flagCode}.svg`}
                        alt={`${loc.name} flag`}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>

                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold leading-tight">{loc.name}</p>
                      <p
                        className={`text-[11px] font-medium ${
                          isSelected
                            ? 'text-white/60 dark:text-slate-900/50'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {shortNames[loc.code]}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 dark:bg-slate-900/20">
                        <CheckCircle className="h-3 w-3" />
                      </div>
                    )}

                    {!isSelected && (
                      <div className="h-5 w-5 rounded-full border-2 border-slate-200 opacity-0 transition-opacity group-hover:opacity-100 dark:border-slate-700" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/30">
              <p className="text-center text-[10px] font-medium text-slate-400 dark:text-slate-500">
                Content will reload in selected language
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
