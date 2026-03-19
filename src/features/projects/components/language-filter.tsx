'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { LANGUAGE_COLORS } from '@/features/projects/lib/github'

interface LanguageFilterProps {
  languages: string[]
  selected: string | null
  onSelect: (language: string | null) => void
}

export function LanguageFilter({ languages, selected, onSelect }: LanguageFilterProps) {
  const t = useTranslations('projectsPage')

  return (
    <div className="flex flex-wrap items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(null)}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
          selected === null
            ? 'bg-foreground text-background shadow-lg'
            : 'bg-surface text-muted hover:bg-surface-hover hover:text-foreground'
        }`}
      >
        {t('filters.all')}
      </motion.button>
      {languages.map((language) => {
        const color = LANGUAGE_COLORS[language] || '#6b7280'
        return (
          <motion.button
            key={language}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(language)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
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
          </motion.button>
        )
      })}
    </div>
  )
}
