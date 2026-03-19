'use client'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'
import type { Repository } from '@/features/projects/lib/github'
import { LANGUAGE_COLORS } from '@/features/projects/lib/github'

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
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const languageColor = repo.language ? LANGUAGE_COLORS[repo.language] || '#6b7280' : '#6b7280'
  const bgStyle = {
    backgroundColor: hexToRgba(languageColor, 0.1),
    color: languageColor,
  }

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30, filter: 'blur(12px)' }}
      animate={
        prefersReducedMotion
          ? { opacity: 1 }
          : isInView
            ? { opacity: 1, y: 0, filter: 'blur(0px)' }
            : undefined
      }
      transition={{
        delay: isInView && !prefersReducedMotion ? index * 0.12 : 0,
        duration: prefersReducedMotion ? 0 : 0.8,
        ease: [0.19, 1, 0.22, 1],
      }}
      className="group relative"
    >
      <a
        href={repo.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="surface-panel group relative block overflow-hidden rounded-4xl border border-line p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-foreground/20 hover:bg-surface hover:shadow-xl dark:backdrop-blur-md"
      >
        <div
          className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10"
          style={{ background: `linear-gradient(to bottom right, ${languageColor}, transparent)` }}
        />

        <div className="absolute top-6 right-6 z-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted shadow-sm">
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
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-line bg-background transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
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

          <div className="grow">
            <h3 className="mb-2 text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-foreground/90">
              {repo.name}
            </h3>
            <p className="mb-4 max-w-2xl text-base leading-relaxed text-muted">
              {repo.description || t('noDescription')}
            </p>

            {repo.topics.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {repo.topics.slice(0, 5).map((topic) => (
                  <span
                    key={topic}
                    className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors group-hover:bg-background group-hover:shadow-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-6">
              {repo.language && (
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: languageColor }}
                  />
                  <span className="font-semibold text-foreground">{repo.language}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-muted">
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

              <div className="flex items-center gap-1.5 text-muted">
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

          <div className="hidden shrink-0 lg:block">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-background text-muted shadow-sm transition-all duration-300 group-hover:translate-x-1 group-hover:border-foreground/20 group-hover:text-foreground">
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
