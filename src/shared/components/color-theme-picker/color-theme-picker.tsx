'use client'

import { Palette } from '@solar-icons/react/ssr'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/shared/store/use-theme/use-theme'
import type { ColorTheme } from '@/shared/store/use-theme/use-theme.types'

const COLOR_THEMES: { id: ColorTheme; label: string; swatch: string; swatchDark: string }[] = [
  { id: 'default', label: 'Default', swatch: '#4f46e5', swatchDark: '#ddff6f' },
  { id: 'ocean', label: 'Ocean', swatch: '#0284c7', swatchDark: '#38bdf8' },
  { id: 'emerald', label: 'Emerald', swatch: '#059669', swatchDark: '#34d399' },
  { id: 'violet', label: 'Violet', swatch: '#7c3aed', swatchDark: '#a78bfa' },
  { id: 'rose', label: 'Rose', swatch: '#e11d48', swatchDark: '#fb7185' },
  { id: 'cherry', label: 'Cherry', swatch: '#db2777', swatchDark: '#f472b6' },
  { id: 'amber', label: 'Amber', swatch: '#d97706', swatchDark: '#fbbf24' },
  { id: 'sunset', label: 'Sunset', swatch: '#ea580c', swatchDark: '#fb923c' },
  { id: 'mono', label: 'Mono', swatch: '#525252', swatchDark: '#d4d4d4' },
]

export function ColorThemePicker() {
  const { colorTheme, setColorTheme, theme, mounted } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  if (!mounted) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-strong/50 opacity-20" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl text-muted transition-all duration-300 hover:bg-surface-strong hover:text-accent-strong active:scale-90"
        aria-label="Change color theme"
      >
        <Palette className="h-5 w-5" />
        <div className="absolute inset-0 -z-10 bg-accent/5 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ duration: 0.18, ease: [0.19, 1, 0.22, 1] }}
            className="absolute right-0 top-full z-50 mt-3 w-52 origin-top-right overflow-hidden rounded-2xl border border-line bg-surface-strong p-3 shadow-panel backdrop-blur-xl"
          >
            <p className="mb-3 px-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Color theme
            </p>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_THEMES.map((t) => {
                const isActive = colorTheme === t.id
                const color = isDark ? t.swatchDark : t.swatch
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setColorTheme(t.id)
                      setOpen(false)
                    }}
                    className={`group/item flex flex-col items-center gap-1.5 rounded-xl px-1 py-2 transition-colors ${
                      isActive ? 'bg-accent/12' : 'hover:bg-surface'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                        isActive ? 'scale-110 shadow-md' : 'group-hover/item:scale-105'
                      }`}
                      style={{
                        borderColor: color,
                        backgroundColor: isActive ? color : 'transparent',
                        boxShadow: isActive ? `0 0 12px ${color}44` : undefined,
                      }}
                    >
                      {isActive && (
                        <motion.div layoutId="color-theme-check">
                          <Palette
                            className="h-3.5 w-3.5"
                            color={isDark && t.id !== 'default' ? '#091113' : '#fff'}
                          />
                        </motion.div>
                      )}
                    </span>
                    <span
                      className={`text-[11px] font-medium leading-none ${
                        isActive ? 'text-foreground' : 'text-muted'
                      }`}
                    >
                      {t.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
