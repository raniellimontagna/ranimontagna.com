'use client'

import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { Post } from '@/features/blog/lib/blog'
import { SafeImage } from './safe-image'

interface PostCardProps {
  post: Post
  index: number
}

export function PostCard({ post, index }: PostCardProps) {
  const t = useTranslations('blog')
  const coverImage = post.metadata.coverImage

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="surface-panel group relative flex h-full flex-col overflow-hidden rounded-4xl border border-line transition-all hover:-translate-y-1 hover:border-foreground/20 hover:bg-surface hover:shadow-xl"
      >
        <div className="relative h-40 overflow-hidden">
          <SafeImage
            src={coverImage}
            alt={post.metadata.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col grow p-6 pt-4">
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
