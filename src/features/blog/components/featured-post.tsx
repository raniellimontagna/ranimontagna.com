'use client'

import dayjs from 'dayjs'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { Post } from '@/features/blog/lib/blog'
import { SafeImage } from './safe-image'

interface FeaturedPostProps {
  post: Post
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  const t = useTranslations('blog')
  const prefersReducedMotion = useReducedMotion()
  const coverImage = post.metadata.coverImage

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 24, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.8, ease: [0.19, 1, 0.22, 1] }}
      className="mb-8 sm:mb-12"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="surface-panel group relative block overflow-hidden rounded-3xl border border-line transition-all sm:rounded-4xl hover:-translate-y-1 hover:border-foreground/20 hover:bg-surface hover:shadow-xl"
      >
        <div className="relative h-40 overflow-hidden sm:h-48 md:h-64">
          <SafeImage
            src={coverImage}
            alt={post.metadata.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent dark:from-slate-900" />
        </div>
        <div className="p-4 pt-4 sm:p-6 sm:pt-5 md:p-8 md:pt-6 lg:p-12 lg:pt-8">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-linear-to-br from-accent/10 to-accent-ice/10 blur-3xl transition-all group-hover:scale-150" />

          <div className="relative">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm sm:mb-6 sm:gap-4">
              <time className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                {dayjs(post.metadata.date).format('MMMM D, YYYY')}
              </time>
              <span className="flex flex-wrap gap-2">
                {post.metadata.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-line/50 bg-surface/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors group-hover:bg-background group-hover:shadow-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </span>
            </div>

            <h2 className="mb-4 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl">
              <span className="bg-linear-to-r from-foreground to-foreground/70 bg-size-[0%_2px] bg-bottom-left bg-no-repeat transition-all duration-500 group-hover:bg-size-[100%_2px]">
                {post.metadata.title}
              </span>
            </h2>

            <p className="mb-6 max-w-3xl text-base leading-relaxed text-muted sm:mb-8 sm:text-lg md:text-xl">
              {post.metadata.description}
            </p>

            <span className="inline-flex items-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform sm:px-6 sm:py-3 group-hover:scale-105">
              {t('readFeaturedStory')}
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
