'use client'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import type { Repository } from '@/lib/github'
import { LANGUAGE_COLORS } from '@/lib/github'

dayjs.extend(relativeTime)

interface FeaturedProjectProps {
  repo: Repository
  index: number
}

// Convert hex to rgba for background opacity
const hexToRgba = (hex: string, alpha: number) => {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function FeaturedProject({ repo, index }: FeaturedProjectProps) {
  const t = useTranslations('projectsPage')
  const languageColor = repo.language ? LANGUAGE_COLORS[repo.language] || '#6b7280' : '#6b7280'
  const bgStyle = {
    backgroundColor: hexToRgba(languageColor, 0.1),
    color: languageColor,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative"
    >
      <a
        href={repo.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-500/10 dark:border-slate-800 dark:bg-slate-900/50 dark:backdrop-blur-md dark:hover:border-purple-500/30"
      >
        {/* Glow Effect */}
        <div
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10"
          style={{ background: `linear-gradient(to bottom right, ${languageColor}, transparent)` }}
        />

        {/* Featured Badge */}
        <div className="absolute right-6 top-6 z-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
            <svg
              className="h-3.5 w-3.5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {t('featured')}
          </span>
        </div>

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
          {/* Main Icon */}
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 dark:border-none dark:bg-transparent"
            style={{ ...bgStyle }}
          >
            <svg
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>

          <div className="flex-grow">
            <h3 className="mb-2 text-2xl font-bold tracking-tight text-slate-800 transition-colors group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
              {repo.name}
            </h3>
            <p className="mb-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
              {repo.description || t('noDescription')}
            </p>

            {/* Topics */}
            {repo.topics.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {repo.topics.slice(0, 5).map((topic) => (
                  <span
                    key={topic}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 transition-colors group-hover:bg-slate-50 group-hover:shadow-sm dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-800/80"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}

            {/* Footer Stats */}
            <div className="flex flex-wrap items-center gap-6">
              {/* Language */}
              {repo.language && (
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: languageColor }}
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {repo.language}
                  </span>
                </div>
              )}

              {/* Stars */}
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <svg
                  className="h-5 w-5 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="font-bold">{repo.stargazers_count}</span>
                <span className="text-sm">{t('stars')}</span>
              </div>

              {/* Forks */}
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span className="font-bold">{repo.forks_count}</span>
                <span className="text-sm">{t('forks')}</span>
              </div>
            </div>
          </div>

          {/* Action Arrow */}
          <div className="hidden shrink-0 lg:block">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all duration-300 group-hover:translate-x-1 group-hover:border-purple-200 group-hover:text-purple-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-500 dark:shadow-none dark:group-hover:text-purple-400">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  )
}
