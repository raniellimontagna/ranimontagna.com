'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { LANGUAGE_COLORS } from '@/lib/github'

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
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
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
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
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
