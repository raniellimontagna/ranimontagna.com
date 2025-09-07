'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import {
  Monitor,
  Server,
  Palette,
  Settings,
  Download,
  MessageCircle,
  User,
  CheckCircle,
} from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'

export function About() {
  const t = useTranslations('about')

  const stats = [
    { number: new Date().getFullYear() - 2021 + '+', label: t('stats.experience') },
    { number: '20+', label: t('stats.projects') },
    { number: '100%', label: t('stats.dedication') },
  ]

  const skills = [
    {
      category: t('skills.categories.frontend'),
      technologies: [
        t('skills.technologies.react'),
        t('skills.technologies.nextjs'),
        t('skills.technologies.typescript'),
        t('skills.technologies.tailwind'),
        t('skills.technologies.reactNative'),
      ],
      icon: Monitor,
    },
    {
      category: t('skills.categories.backend'),
      technologies: [
        t('skills.technologies.nodejs'),
        t('skills.technologies.fastify'),
        t('skills.technologies.postgresql'),
        t('skills.technologies.prisma'),
        t('skills.technologies.jwt'),
      ],
      icon: Server,
    },
    {
      category: t('skills.categories.design'),
      technologies: [
        t('skills.technologies.figma'),
        t('skills.technologies.uiux'),
        t('skills.technologies.prototyping'),
        t('skills.technologies.designSystem'),
        t('skills.technologies.accessibility'),
      ],
      icon: Palette,
    },
    {
      category: t('skills.categories.tools'),
      technologies: [
        t('skills.technologies.git'),
        t('skills.technologies.docker'),
        t('skills.technologies.vscode'),
        t('skills.technologies.postman'),
        t('skills.technologies.vercel'),
      ],
      icon: Settings,
    },
  ]

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-slate-50 py-16 sm:py-20 lg:py-32 dark:bg-slate-900"
    >
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1e293b08_1px,transparent_1px),linear-gradient(-45deg,#64748b08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-slate-200/20 blur-3xl sm:top-32 sm:right-32 dark:bg-slate-700/20"></div>
        <div className="absolute -bottom-16 left-0 h-80 w-80 rounded-full bg-slate-300/10 blur-3xl sm:bottom-32 sm:left-32 dark:bg-slate-600/10"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center lg:mb-16">
          <FadeIn delay={0.2}>
            <div className="mb-6 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <User className="mr-2 h-4 w-4" />
              {t('badge')}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <h2 className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-6xl dark:text-slate-100">
              {t('title.part1')}{' '}
              <span className="text-slate-600 dark:text-slate-400">{t('title.part2')}</span>
            </h2>
          </FadeIn>
        </div>

        <div className="mb-16 grid items-center gap-12 lg:mb-20 lg:grid-cols-2 lg:gap-16">
          <FadeIn delay={0.6} direction="left">
            <div className="relative">
              <div className="absolute -inset-2 rounded-2xl bg-slate-200 opacity-20 blur transition duration-1000 sm:-inset-4 dark:bg-slate-700"></div>
              <div className="absolute -top-2 -right-2 h-12 w-12 rounded-full bg-slate-300/30 sm:-top-4 sm:-right-4 sm:h-16 sm:w-16 dark:bg-slate-600/30"></div>
              <div className="absolute -bottom-2 -left-2 h-16 w-16 rounded-full bg-slate-400/20 sm:-bottom-4 sm:-left-4 sm:h-20 sm:w-20 dark:bg-slate-500/20"></div>

              <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-6 dark:border-slate-700 dark:bg-slate-800">
                <Image
                  src="/photo.webp"
                  alt={t('bio.name')}
                  width={400}
                  height={400}
                  className="w-full rounded-xl object-cover"
                />
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.8} direction="right">
            <div className="space-y-6 text-center lg:text-left">
              <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                <p>
                  {t('bio.greeting')}{' '}
                  <strong className="text-slate-900 dark:text-slate-100">{t('bio.name')}</strong>,{' '}
                  {t('bio.intro')}
                </p>
                <p>{t('bio.journey')}</p>
                <p>{t('bio.hobbies')}</p>
              </div>

              <div className="flex flex-col items-center gap-4 pt-6 sm:flex-row lg:items-start">
                <a
                  href="/cv_en.pdf"
                  download={t('cta.resumeFilename')}
                  className="group relative inline-flex w-full items-center justify-center rounded-lg border-2 border-transparent bg-slate-900 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-slate-800 hover:shadow-xl focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none sm:w-auto dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  <Download className="mr-2 h-5 w-5" />
                  {t('cta.resume')}
                </a>

                <a
                  href="#contact"
                  className="group inline-flex w-full items-center justify-center rounded-lg border-2 border-slate-300 bg-transparent px-8 py-4 text-lg font-medium text-slate-700 transition-all duration-300 hover:border-slate-500 hover:text-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none sm:w-auto dark:border-slate-600 dark:text-slate-300 dark:hover:text-slate-100"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {t('cta.contact')}
                </a>
              </div>
            </div>
          </FadeIn>
        </div>

        <StaggerContainer staggerDelay={0.15}>
          <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3 lg:mb-20 lg:gap-8">
            {stats.map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="group text-center">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 group-hover:scale-105 hover:shadow-xl sm:p-8 dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-2 text-4xl font-bold text-slate-800 dark:text-slate-200">
                      {stat.number}
                    </div>
                    <div className="font-medium text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        <FadeIn delay={1.2}>
          <div>
            <h3 className="mb-10 text-center text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t('skills.title')}
            </h3>

            <StaggerContainer staggerDelay={0.1}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {skills.map((skill) => {
                  const IconComponent = skill.icon
                  return (
                    <StaggerItem key={skill.category}>
                      <div className="group rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
                        <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
                          <IconComponent className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                        </div>
                        <h4 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {skill.category}
                        </h4>
                        <ul className="space-y-2">
                          {skill.technologies.map((tech) => (
                            <li
                              key={tech}
                              className="flex items-center text-sm text-slate-600 dark:text-slate-400"
                            >
                              <CheckCircle className="mr-2 h-3 w-3 text-slate-400 dark:text-slate-500" />
                              {tech}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </StaggerItem>
                  )
                })}
              </div>
            </StaggerContainer>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
