'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowDown } from 'lucide-react'

export function Hero() {
  const t = useTranslations('hero')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const skillsList = t.raw('skills.list') as string[]

  return (
    <section
      id="start"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 pt-32 pb-20 sm:px-6 sm:pt-40 sm:pb-24 lg:px-8 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20"
    >
      <div className="absolute inset-0 opacity-40 dark:opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f615_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf615_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 animate-pulse rounded-full bg-blue-500/20 blur-3xl sm:-top-40 sm:-right-40"></div>
        <div className="absolute -bottom-20 -left-20 h-80 w-80 animate-pulse rounded-full bg-purple-500/20 blur-3xl delay-1000 sm:-bottom-40 sm:-left-40"></div>
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform animate-pulse rounded-full bg-indigo-500/15 blur-3xl delay-500"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl text-center">
        <div
          className={`mb-8 inline-flex items-center rounded-full border border-blue-200/50 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 text-sm font-medium text-blue-700 transition-all duration-1000 dark:border-blue-700/50 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
          {t('availability')}
        </div>

        <h1
          className={`mb-6 text-4xl font-bold text-gray-900 transition-all delay-200 duration-1000 sm:text-6xl lg:text-7xl dark:text-white ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {t('greeting')}{' '}
          <span className="animate-gradient bg-300% bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text bg-left text-transparent">
            {t('name')}
          </span>
        </h1>

        <p
          className={`mx-auto mb-8 max-w-4xl text-lg leading-relaxed text-gray-600 transition-all delay-400 duration-1000 sm:text-xl lg:text-2xl dark:text-gray-300 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {t('passion.part1')}{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-semibold text-transparent">
            {t('passion.highlight')}
          </span>{' '}
          {t('passion.part2')}
        </p>

        <p
          className={`mx-auto mb-10 max-w-2xl text-base text-gray-500 transition-all delay-600 duration-1000 lg:text-lg dark:text-gray-400 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {t('description')}
        </p>

        <div
          className={`flex flex-col items-center justify-center gap-4 transition-all delay-800 duration-1000 sm:flex-row sm:gap-6 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <a
            href="#projects"
            className="group relative inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:w-auto"
          >
            <span className="relative z-10">{t('cta.projects')}</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </a>

          <a
            href="#contact"
            className="group inline-flex w-full items-center justify-center rounded-lg border-2 border-gray-200 bg-white/80 px-8 py-4 text-lg font-medium text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-blue-500 hover:text-blue-600 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:w-auto dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:text-blue-400"
          >
            {t('cta.contact')}
            <svg
              className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>

        <div
          className={`mt-12 transition-all delay-1000 duration-1000 lg:mt-16 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{t('skills.title')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {skillsList.map((tech, index) => (
              <span
                key={tech}
                className="rounded-full border border-white/20 bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-xl dark:border-gray-700/50 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 transform cursor-pointer"
        onClick={() => {
          const section = document.getElementById('about')
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' })
          }
        }}
      >
        <div className="group flex h-10 w-6 animate-bounce justify-center rounded-full border-2 border-gray-400 transition-colors hover:border-blue-500 dark:border-gray-600 dark:hover:border-blue-400">
          <ArrowDown className="mt-3 h-4 w-4 text-gray-400 transition-colors group-hover:text-blue-500 dark:text-gray-600 dark:group-hover:text-blue-400" />
        </div>
      </div>
    </section>
  )
}
