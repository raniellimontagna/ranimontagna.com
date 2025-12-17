'use client'

import { Building2, Calendar, MapPin } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'
import { experiences } from './experience.static'

export function Experience() {
  const t = useTranslations('experience')

  return (
    <section
      id="experience"
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-32 dark:bg-slate-950"
    >
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 -z-10 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-blue-500/5 blur-[120px]" />
      <div className="absolute top-1/2 right-0 -z-10 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-purple-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center lg:mb-16">
          <FadeIn delay={0.2}>
            <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 font-mono text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-300">
              <Building2 className="mr-2 h-4 w-4" />
              {t('badge')}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-slate-100">
              {t('title.part1')}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                {t('title.part2')}
              </span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.6}>
            <p className="mx-auto max-w-3xl text-lg text-slate-600 dark:text-slate-400">
              {t('subtitle')}
            </p>
          </FadeIn>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-0 bottom-0 left-6 w-px transform bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-transparent md:left-1/2 md:-translate-x-px" />

          <StaggerContainer staggerDelay={0.2}>
            <div className="space-y-12">
              {experiences(t).map((exp, index) => (
                <StaggerItem key={exp.company}>
                  <div className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute left-6 z-10 flex h-8 w-8 -translate-x-1/2 transform items-center justify-center rounded-full border-4 border-white bg-white shadow-lg md:left-1/2 dark:border-slate-950 dark:bg-slate-950">
                      <div
                        className={`h-3 w-3 rounded-full ${exp.current ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}
                      />
                    </div>

                    <div
                      className={`ml-16 md:ml-0 ${
                        index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'
                      } md:w-1/2 ${index % 2 === 0 ? 'md:ml-0' : 'md:ml-auto'}`}
                    >
                      <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                        {/* Glow Effect on Hover */}
                        <div className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-sm" />
                        <div className="absolute inset-0 -z-10 rounded-2xl bg-white dark:bg-slate-900" />

                        <div
                          className={`mb-6 flex flex-col gap-4 ${
                            index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'
                          }`}
                        >
                          {/* Logo */}
                          <div className={`flex-shrink-0 ${index % 2 === 0 ? 'md:ml-auto' : ''}`}>
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-sm sm:h-14 sm:w-14 dark:border-slate-800 dark:bg-slate-800">
                              <Image
                                src={exp.logo}
                                alt={t('logoAlt', { company: exp.company })}
                                width={48}
                                height={48}
                                className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                                quality={100}
                              />
                            </div>
                          </div>

                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-slate-100">
                              {exp.position}
                            </h3>
                            <div
                              className={`mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400 ${index % 2 === 0 ? 'md:justify-end' : ''}`}
                            >
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {exp.company}
                              </span>
                              <span>•</span>
                              <div className="flex items-center gap-1 font-mono text-xs">
                                <Calendar className="h-3 w-3" />
                                {exp.period}
                              </div>
                            </div>
                            <div
                              className={`mt-1 flex items-center gap-1 text-xs text-slate-400 ${index % 2 === 0 ? 'md:justify-end' : ''}`}
                            >
                              <MapPin className="h-3 w-3" />
                              {exp.location}
                            </div>
                          </div>
                        </div>

                        <p
                          className={`mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400 ${
                            index % 2 === 0 ? 'md:text-right' : ''
                          }`}
                        >
                          {exp.description}
                        </p>

                        {/* Highlights */}
                        <div className="mb-6 space-y-3">
                          {exp.highlights.map((highlight, idx) => (
                            <div
                              key={idx}
                              className={`flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 ${index % 2 === 0 ? 'md:justify-end' : ''}`}
                            >
                              {index % 2 !== 0 && (
                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                              )}
                              <span className={index % 2 === 0 ? 'md:text-right' : ''}>
                                {highlight}
                              </span>
                              {index % 2 === 0 && (
                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500 hidden md:block" />
                              )}
                              {index % 2 === 0 && (
                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500 md:hidden" />
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Technologies */}
                        <div
                          className={`flex flex-wrap gap-2 ${
                            index % 2 === 0 ? 'md:justify-end' : ''
                          }`}
                        >
                          {exp.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-slate-600"
                            >
                              {tech}
                            </span>
                          ))}
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
