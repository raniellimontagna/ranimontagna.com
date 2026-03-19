'use client'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'
import type { Repository } from '@/features/projects/lib/github'
import { LANGUAGE_COLORS } from '@/features/projects/lib/github'

dayjs.extend(relativeTime)

interface ProjectCardProps {
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

export function ProjectCard({ repo, index }: ProjectCardProps) {
  const t = useTranslations('projectsPage')
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const languageColor = repo.language ? LANGUAGE_COLORS[repo.language] || '#6b7280' : '#6b7280'
  const bgStyle = {
    backgroundColor: hexToRgba(languageColor, 0.1),
    color: languageColor,
  }

  return (
    <motion.div
      ref={ref}
      initial={
        prefersReducedMotion
          ? { opacity: 1 }
          : { opacity: 0, y: 20, filter: 'blur(6px)', scale: 0.97 }
      }
      animate={
        prefersReducedMotion
          ? { opacity: 1 }
          : isInView
            ? { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }
            : undefined
      }
      transition={{
        delay: isInView && !prefersReducedMotion ? index * 0.05 : 0,
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: [0.19, 1, 0.22, 1],
      }}
    >
      <a
        href={repo.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="surface-panel group relative flex h-full flex-col overflow-hidden rounded-4xl border border-line p-6 transition-all hover:-translate-y-1 hover:border-foreground/20 hover:bg-surface hover:shadow-xl"
      >
        <div
          className="absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10"
          style={{ background: `linear-gradient(to bottom right, ${languageColor}, transparent)` }}
        />

        <div className="relative z-10 mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-background transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={bgStyle}
            >
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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-foreground transition-colors group-hover:text-foreground/90">
                {repo.name}
              </h3>
            </div>
          </div>

          {repo.homepage && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.open(repo.homepage as string, '_blank', 'noopener,noreferrer')
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-muted opacity-0 transition-all duration-300 hover:bg-background hover:text-foreground group-hover:opacity-100"
              aria-label={t('visitSite')}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          )}
        </div>

        <p className="relative z-10 mb-6 line-clamp-2 grow text-sm leading-relaxed text-muted">
          {repo.description || t('noDescription')}
        </p>

        {repo.topics.length > 0 && (
          <div className="relative z-10 mb-6 flex flex-wrap gap-2">
            {repo.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="rounded-md border border-line bg-surface px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-muted"
              >
                {topic}
              </span>
            ))}
            {repo.topics.length > 3 && (
              <span className="rounded-md border border-line/50 bg-surface/50 px-2 py-1 font-mono text-[9px] text-muted/70">
                +{repo.topics.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="relative z-10 mt-auto flex items-center justify-between border-t border-line pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted">
              <svg
                className="h-4 w-4 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>{repo.stargazers_count}</span>
            </div>

            <div className="flex items-center gap-1.5 text-sm font-medium text-muted">
              <svg
                className="h-4 w-4 text-muted group-hover:text-foreground"
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
              <span>{repo.forks_count}</span>
            </div>
          </div>

          {repo.language && (
            <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: languageColor }} />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {repo.language}
              </span>
            </div>
          )}
        </div>
      </a>
    </motion.div>
  )
}
