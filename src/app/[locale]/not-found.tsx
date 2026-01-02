'use client'

import { ArrowLeft, ArrowRight, Document, Letter, Suitcase, User } from '@solar-icons/react/ssr'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { StaggerContainer, StaggerItem } from '@/components/animations'

export default function NotFoundPage() {
  const t = useTranslations('notFound')

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white selection:bg-blue-500/30 dark:bg-slate-950">
      {/* Dynamic Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[70vw] w-[70vw] rounded-full bg-blue-500/5 blur-[120px] dark:bg-blue-600/10" />
        <div className="absolute -right-[10%] -bottom-[20%] h-[70vw] w-[70vw] rounded-full bg-purple-500/5 blur-[120px] dark:bg-purple-600/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.05]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <filter id="noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>
      </div>

      <StaggerContainer className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* 404 Visual Element */}
          <StaggerItem className="relative mb-2 select-none">
            <span className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 text-[12rem] font-bold tracking-tight text-slate-950/5 blur-sm sm:text-[20rem] dark:text-white/5">
              404
            </span>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-8xl font-black text-transparent tracking-tighter sm:text-9xl"
            >
              404
            </motion.div>
          </StaggerItem>

          {/* Main Content */}
          <StaggerItem className="max-w-2xl">
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              {t('title')}
            </h1>
            <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              {t('description')}
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-slate-900 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-1 hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-900/20 dark:bg-white dark:text-slate-900 dark:shadow-white/5 dark:hover:bg-slate-100 dark:hover:shadow-white/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                {t('backHome')}
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-10 dark:from-blue-400 dark:to-purple-400" />
              </Link>
              <Link
                href="#contact"
                className="group inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-3.5 text-base font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Letter className="mr-2 h-4 w-4" />
                {t('contact')}
              </Link>
            </div>
          </StaggerItem>

          {/* Quick Links Section */}
          <StaggerItem className="mt-20 w-full max-w-4xl">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-slate-500 uppercase tracking-wider dark:bg-slate-950">
                  {t('suggestions')}
                </span>
              </div>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full">
              {[
                {
                  key: 'about',
                  href: '/#about',
                  icon: User,
                  color: 'text-blue-500',
                  bg: 'bg-blue-500/10 dark:bg-blue-500/20',
                  borderColor: 'group-hover:border-blue-500/50',
                  shadowColor: 'group-hover:shadow-blue-500/10',
                },
                {
                  key: 'projects',
                  href: '/#projects',
                  icon: Suitcase,
                  color: 'text-purple-500',
                  bg: 'bg-purple-500/10 dark:bg-purple-500/20',
                  borderColor: 'group-hover:border-purple-500/50',
                  shadowColor: 'group-hover:shadow-purple-500/10',
                },
                {
                  key: 'blog',
                  href: '/blog',
                  icon: Document,
                  color: 'text-pink-500',
                  bg: 'bg-pink-500/10 dark:bg-pink-500/20',
                  borderColor: 'group-hover:border-pink-500/50',
                  shadowColor: 'group-hover:shadow-pink-500/10',
                },
                {
                  key: 'contact',
                  href: '/#contact',
                  icon: Letter,
                  color: 'text-green-500',
                  bg: 'bg-green-500/10 dark:bg-green-500/20',
                  borderColor: 'group-hover:border-green-500/50',
                  shadowColor: 'group-hover:shadow-green-500/10',
                },
              ].map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`group relative flex flex-col items-center rounded-2xl border border-slate-200 bg-white/50 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50 ${link.borderColor} ${link.shadowColor}`}
                >
                  <div
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${link.bg} ${link.color}`}
                  >
                    <link.icon className="h-7 w-7" />
                  </div>
                  <span className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
                    {t(`links.${link.key}.title`)}
                  </span>
                  <p className="mb-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t(`links.${link.key}.description`)}
                  </p>

                  <span
                    className={`inline-flex items-center text-xs font-semibold uppercase tracking-wider transition-colors ${link.color}`}
                  >
                    {t('visitSection')}
                    <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </StaggerItem>
        </div>
      </StaggerContainer>
    </div>
  )
}
