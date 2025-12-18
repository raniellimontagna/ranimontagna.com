'use client'

import { Check, Globe } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { locales } from '@/i18n/routing'

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const locale = useLocale()
  const pathname = usePathname()
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
    const newPathname = pathname.startsWith(`/${locale}`) ? pathname.substring(3) : pathname
    window.location.href = `/${newLocale}${newPathname || '/'}`
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={switcherRef}>
      <button
        type="button"
        data-testid="language-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg p-2 text-slate-600 transition-all duration-300 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        aria-label="Change language"
      >
        <Globe className="h-5 w-5" />
        <span className="hidden text-sm font-medium lg:block">{locale.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 origin-top-right rounded-lg border border-slate-200/80 bg-white/80 shadow-lg backdrop-blur-lg transition-all duration-300 dark:border-slate-700/80 dark:bg-slate-900/80">
          <div className="p-1">
            {locales.map((loc) => (
              <button
                type="button"
                aria-label={`Change language to ${loc.name}`}
                data-testid={`language-option-${loc.code}`}
                key={loc.code}
                onClick={() => handleLocaleChange(loc.code)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  locale === loc.code
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {loc.name}
                {locale === loc.code && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
