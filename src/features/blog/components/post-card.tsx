'use client'

import dayjs from 'dayjs'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'
import type { Post } from '@/features/blog/lib/blog'
import { Link } from '@/shared/config/i18n/navigation'
import { SafeImage } from './safe-image'

interface PostCardProps {
  post: Post
  index: number
}

export function PostCard({ post, index }: PostCardProps) {
  const t = useTranslations('blog')
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })
  const coverImage = post.metadata.coverImage

  return (
    <motion.div
      ref={ref}
      initial={
        prefersReducedMotion
          ? { opacity: 1 }
          : { opacity: 0, y: 24, filter: 'blur(8px)', scale: 0.97 }
      }
      animate={
        prefersReducedMotion
          ? { opacity: 1 }
          : isInView
            ? { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }
            : undefined
      }
      transition={{
        delay: isInView && !prefersReducedMotion ? index * 0.1 : 0,
        duration: prefersReducedMotion ? 0 : 0.7,
        ease: [0.19, 1, 0.22, 1],
      }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="surface-panel group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line transition-all sm:rounded-4xl hover:-translate-y-1 hover:border-foreground/20 hover:bg-surface hover:shadow-xl"
      >
        <div className="relative h-40 overflow-hidden">
          <SafeImage
            src={coverImage}
            alt={post.metadata.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex grow flex-col p-4 pt-3 sm:p-5 sm:pt-4 lg:p-6 lg:pt-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <time className="text-xs font-medium text-muted">
              {dayjs(post.metadata.date).format('MMM D, YYYY')}
            </time>
            <div className="flex flex-wrap justify-end gap-2">
              {post.metadata.tags?.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-line/50 bg-surface/50 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <h3 className="mb-3 text-xl font-semibold tracking-[-0.03em] text-foreground transition-colors group-hover:text-foreground/80">
            {post.metadata.title}
          </h3>

          <p className="mb-6 grow text-sm leading-relaxed text-muted">
            {post.metadata.description}
          </p>

          <div className="flex items-center text-sm font-medium text-foreground transition-colors">
            {t('readArticle')}
            <svg
              className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
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
      </Link>
    </motion.div>
  )
}
