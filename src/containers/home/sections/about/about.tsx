'use client'

import { FadeIn } from '@/components/animations'
import { getResumeByLocale } from '@/constants/socialLinks'
import { Download, MessageCircle, User } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'

export function About() {
  const t = useTranslations('about')
  const locale = useLocale()
  const resumeLink = getResumeByLocale(locale as 'en' | 'pt' | 'es')

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-32 dark:bg-slate-950"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-500/5" />
      <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px] dark:bg-purple-500/5" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left Column: Image with Glass Frame */}
          <FadeIn delay={0.2} direction="right">
            <div className="relative mx-auto max-w-[400px] lg:mx-0 lg:max-w-none">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900">
                {/* Glass Frame Effect */}
                <div className="absolute inset-0 z-10 rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-[2px] dark:border-white/10 dark:bg-white/5" />
                <div className="absolute inset-4 z-20 overflow-hidden rounded-xl">
                  <Image
                    src="/photo.webp"
                    alt={t('bio.name')}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform duration-700 hover:scale-110"
                    priority
                  />
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 z-0 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-20 blur-xl" />
                <div className="absolute -bottom-6 -left-6 z-0 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur-xl" />
              </div>
            </div>
          </FadeIn>

          {/* Right Column: Content */}
          <FadeIn delay={0.4} direction="left">
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 font-mono text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-300">
                <User className="mr-2 h-4 w-4" />
                {t('badge')}
              </div>

              <h2 className="mb-8 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-slate-100">
                {t('title.part1')}{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                  {t('title.part2')}
                </span>
              </h2>

              <div className="space-y-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                <p>
                  {t('bio.greeting')}{' '}
                  <strong className="font-semibold text-slate-900 dark:text-slate-100">
                    {t('bio.name')}
                  </strong>
                  , {t('bio.intro')}
                </p>
                <p>{t('bio.journey')}</p>
                <p>{t('bio.hobbies')}</p>
              </div>

              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <a
                  href={resumeLink.href}
                  download={resumeLink.filename}
                  className="group inline-flex items-center justify-center rounded-xl bg-slate-900 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-slate-800 hover:ring-4 hover:ring-slate-200 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:hover:ring-slate-800"
                >
                  <Download className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                  {resumeLink.name}
                </a>

                <a
                  href="#contact"
                  className="group inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:ring-4 hover:ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:ring-slate-800"
                >
                  <MessageCircle className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                  {t('cta.contact')}
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
