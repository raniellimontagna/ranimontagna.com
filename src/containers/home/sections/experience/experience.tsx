'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Building2, Calendar, MapPin, ChevronRight } from 'lucide-react'
import { experiences } from './experience.static'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'

export function Experience() {
  const t = useTranslations('experience')

  return (
    <section
      id="experience"
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-32 dark:bg-slate-900"
    >
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1e293b08_1px,transparent_1px),linear-gradient(-45deg,#64748b08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 right-32 h-64 w-64 rounded-full bg-slate-200/20 blur-3xl dark:bg-slate-700/20"></div>
        <div className="absolute bottom-32 left-32 h-80 w-80 rounded-full bg-slate-300/10 blur-3xl dark:bg-slate-600/10"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center lg:mb-16">
          <FadeIn delay={0.2}>
            <div className="mb-6 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Building2 className="mr-2 h-4 w-4" />
              {t('badge')}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <h2 className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-6xl dark:text-slate-100">
              {t('title.part1')}{' '}
              <span className="text-slate-600 dark:text-slate-400">{t('title.part2')}</span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.6}>
            <p className="mx-auto max-w-3xl text-base text-slate-600 sm:text-lg dark:text-slate-400">
              {t('subtitle')}
            </p>
          </FadeIn>
        </div>

        <div className="relative">
          <div className="absolute top-0 bottom-0 left-6 w-0.5 transform bg-slate-200 md:left-1/2 md:-translate-x-px dark:bg-slate-700"></div>

          <StaggerContainer staggerDelay={0.2}>
            <div className="space-y-12">
              {experiences(t).map((exp, index) => (
                <StaggerItem key={exp.company}>
                  <div className="relative">
                    <div className="absolute left-4 z-10 h-4 w-4 transform rounded-full border-4 border-white bg-slate-600 md:left-1/2 md:-translate-x-1/2 dark:border-slate-900 dark:bg-slate-400">
                      {exp.current && (
                        <div className="absolute inset-0 animate-pulse rounded-full bg-green-500"></div>
                      )}
                    </div>

                    <div
                      className={`ml-12 md:ml-0 ${
                        index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'
                      } md:w-1/2 ${index % 2 === 0 ? 'md:ml-0' : 'md:ml-auto'}`}
                    >
                      <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl sm:p-8 dark:border-slate-700 dark:bg-slate-800">
                        <div
                          className={`mb-6 flex items-center gap-4 ${
                            index % 2 === 0 ? 'md:flex-row-reverse' : ''
                          }`}
                        >
                          <div className="flex-shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100 sm:h-16 sm:w-16 dark:bg-slate-700">
                              <Image
                                src={exp.logo}
                                alt={t('logoAlt', { company: exp.company })}
                                width={48}
                                height={48}
                                className="h-12 w-12 object-cover sm:h-16 sm:w-16"
                                quality={100}
                              />
                            </div>
                          </div>

                          <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                            <h3 className="mb-1 text-base font-bold text-slate-900 sm:text-xl dark:text-slate-100">
                              {exp.position}
                            </h3>
                            <p className="mb-2 text-sm font-semibold text-slate-600 sm:text-lg dark:text-slate-400">
                              {exp.company}
                            </p>

                            <div
                              className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-500 ${
                                index % 2 === 0 ? 'md:justify-end' : ''
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {exp.period}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {exp.location}
                              </div>
                              {exp.current && (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  {t('currentLabel')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <p
                          className={`mb-6 leading-relaxed text-slate-600 dark:text-slate-400 ${
                            index % 2 === 0 ? 'md:text-right' : ''
                          }`}
                        >
                          {exp.description}
                        </p>

                        <div className={`mb-6 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                          <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {t('highlightsTitle')}
                          </h4>
                          <ul className={`space-y-2 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                            {exp.highlights.map((highlight, idx) => (
                              <li
                                key={idx}
                                className={`flex items-start gap-2 ${
                                  index % 2 === 0 ? 'md:flex-row-reverse md:text-right' : ''
                                }`}
                              >
                                <ChevronRight
                                  className={`mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400 ${
                                    index % 2 === 0 ? 'transform-none md:rotate-180' : ''
                                  }`}
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {highlight}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className={`${index % 2 === 0 ? 'md:text-right' : ''}`}>
                          <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {t('technologiesTitle')}
                          </h4>
                          <div
                            className={`flex flex-wrap gap-2 ${
                              index % 2 === 0 ? 'md:justify-end' : ''
                            }`}
                          >
                            {exp.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </div>
      </div>
    </section>
  )
}
