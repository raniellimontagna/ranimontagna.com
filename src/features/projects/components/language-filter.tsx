'use client'

import { useTranslations } from 'next-intl'
import { LANGUAGE_COLORS } from '@/features/projects/lib/project-presentation'

interface LanguageFilterProps {
  languages: string[]
  selected: string | null
  onSelect: (language: string | null) => void
}

export function LanguageFilter({ languages, selected, onSelect }: LanguageFilterProps) {
  const t = useTranslations('projectsPage')

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-pressed={selected === null}
        onClick={() => onSelect(null)}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-all motion-safe:hover:scale-105 motion-safe:active:scale-95 ${
          selected === null
            ? 'bg-foreground text-background shadow-lg'
            : 'bg-surface text-muted hover:bg-surface-hover hover:text-foreground'
        }`}
      >
        {t('filters.all')}
      </button>
      {languages.map((language) => {
        const color = LANGUAGE_COLORS[language] || '#6b7280'
        return (
          <button
            type="button"
            aria-pressed={selected === language}
            key={language}
            onClick={() => onSelect(language)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all motion-safe:hover:scale-105 motion-safe:active:scale-95 ${
              selected === language
                ? 'bg-foreground text-background shadow-lg'
                : 'bg-surface text-muted hover:bg-surface-hover hover:text-foreground'
            }`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: selected === language ? 'white' : color }}
            />
            {language}
          </button>
        )
      })}
    </div>
  )
}
