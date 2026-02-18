'use client'

import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { Post } from '@/features/blog/lib/blog'
import { SafeImage } from './safe-image'

interface FeaturedPostProps {
  post: Post
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  const t = useTranslations('blog')
  const coverImage = post.metadata.coverImage

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group relative block overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900/80"
      >
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <SafeImage
            src={coverImage}
            alt={post.metadata.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent dark:from-slate-900" />
        </div>
        <div className="p-8 md:p-12 pt-6 md:pt-8">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-linear-to-br from-purple-500/10 to-blue-500/10 blur-3xl transition-all group-hover:scale-150" />

          <div className="relative">
            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm">
              <time className="rounded-full border border-slate-200 px-3 py-1 font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                {dayjs(post.metadata.date).format('MMMM D, YYYY')}
              </time>
              <span className="flex flex-wrap gap-2">
                {post.metadata.tags?.map((tag) => (
                  <span key={tag} className="font-medium text-purple-600 dark:text-purple-400">
                    #{tag}
                  </span>
                ))}
              </span>
            </div>

            <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl dark:text-white">
              <span className="bg-linear-to-r from-slate-900 to-slate-600 bg-size-[0%_2px] bg-bottom-left bg-no-repeat transition-all duration-500 group-hover:bg-size-[100%_2px] dark:from-white dark:to-slate-300">
                {post.metadata.title}
              </span>
            </h2>

            <p className="mb-8 max-w-3xl text-lg text-slate-600 md:text-xl dark:text-slate-300">
              {post.metadata.description}
            </p>

            <span className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-transform group-hover:scale-105 dark:bg-white dark:text-slate-900">
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
