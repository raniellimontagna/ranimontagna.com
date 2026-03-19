'use client'

import { motion, useInView, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'
import type { GitHubStats as GitHubStatsType } from '@/features/projects/lib/github'
import { CountUp } from '@/shared/components/animations'

interface GitHubStatsProps {
  stats: GitHubStatsType
}

export function GitHubStats({ stats }: GitHubStatsProps) {
  const t = useTranslations('projectsPage')
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const statItems = [
    {
      label: t('stats.repos'),
      value: stats.public_repos,
      color: 'from-blue-500 to-cyan-400',
      bgSync: 'bg-blue-500/10 text-blue-500',
      icon: (
        <svg
          className="h-7 w-7"
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
      ),
    },
    {
      label: t('stats.stars'),
      value: stats.total_stars,
      color: 'from-yellow-400 to-orange-500',
      bgSync: 'bg-yellow-500/10 text-yellow-500',
      icon: (
        <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      label: t('stats.followers'),
      value: stats.followers,
      color: 'from-purple-500 to-pink-500',
      bgSync: 'bg-purple-500/10 text-purple-500',
      icon: (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ]

  return (
    <div ref={ref} className="grid gap-6 sm:grid-cols-3">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={
            prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20, filter: 'blur(8px)' }
          }
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : isInView
                ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                : undefined
          }
          transition={{
            delay: isInView && !prefersReducedMotion ? index * 0.12 : 0,
            duration: prefersReducedMotion ? 0 : 0.7,
            ease: [0.19, 1, 0.22, 1],
          }}
          whileHover={prefersReducedMotion ? undefined : { y: -5, scale: 1.02 }}
          className="surface-panel group relative overflow-hidden rounded-4xl border border-line p-6 shadow-sm"
        >
          <div
            className={`absolute -top-6 -right-6 h-24 w-24 rounded-full bg-linear-to-br ${item.color} opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-20`}
          />

          <div className="relative z-10 flex items-center gap-5">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${item.bgSync} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}
            >
              {item.icon}
            </div>

            <div className="flex flex-col">
              <CountUp
                value={item.value}
                delay={0.3 + index * 0.15}
                className="text-3xl font-semibold tracking-[-0.04em] text-foreground"
              />
              <span className="text-sm font-medium text-muted">{item.label}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
