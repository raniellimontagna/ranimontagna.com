'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Building2, Calendar, MapPin, ChevronRight } from 'lucide-react'

export function Experience() {
  const t = useTranslations('experience')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const experiences = [
    {
      company: t('jobs.luizalabs.company'),
      position: t('jobs.luizalabs.position'),
      period: t('jobs.luizalabs.period'),
      location: t('jobs.luizalabs.location'),
      logo: '/companies/luizalabs.webp',
      description: t('jobs.luizalabs.description'),
      highlights: t.raw('jobs.luizalabs.highlights') as string[],
      technologies: ['React', 'React Native', 'Node.js', 'Go', 'APIs REST'],
      current: true,
    },
    {
      company: t('jobs.smarten.company'),
      position: t('jobs.smarten.position'),
      period: t('jobs.smarten.period'),
      location: t('jobs.smarten.location'),
      logo: '/companies/smarten.webp',
      description: t('jobs.smarten.description'),
      highlights: t.raw('jobs.smarten.highlights') as string[],
      technologies: ['JavaScript', 'React', 'Design System', 'CI/CD', 'Monitoramento'],
      current: false,
    },
    {
      company: t('jobs.sbsistemas.company'),
      position: t('jobs.sbsistemas.position'),
      period: t('jobs.sbsistemas.period'),
      location: t('jobs.sbsistemas.location'),
      logo: '/companies/sbsistemas.svg',
      description: t('jobs.sbsistemas.description'),
      highlights: t.raw('jobs.sbsistemas.highlights') as string[],
      technologies: ['React', 'Electron', 'TypeScript', 'JavaScript', 'Front-end'],
      current: false,
    },
  ]

  return (
    <section
      id="experience"
      className="relative overflow-hidden bg-white py-20 lg:py-32 dark:bg-slate-900"
    >
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1e293b08_1px,transparent_1px),linear-gradient(-45deg,#64748b08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 right-32 h-64 w-64 rounded-full bg-slate-200/20 blur-3xl dark:bg-slate-700/20"></div>
        <div className="absolute bottom-32 left-32 h-80 w-80 rounded-full bg-slate-300/10 blur-3xl dark:bg-slate-600/10"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div
            className={`mb-6 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-1000 dark:bg-slate-800 dark:text-slate-300 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <Building2 className="mr-2 h-4 w-4" />
            {t('badge')}
          </div>

          <h2
            className={`mb-6 text-4xl font-bold text-slate-900 transition-all delay-200 duration-1000 sm:text-5xl lg:text-6xl dark:text-slate-100 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {t('title.part1')}{' '}
            <span className="text-slate-600 dark:text-slate-400">{t('title.part2')}</span>
          </h2>

          <p
            className={`mx-auto max-w-3xl text-lg text-slate-600 transition-all delay-400 duration-1000 dark:text-slate-400 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {t('subtitle')}
          </p>
        </div>

        <div className="relative">
          <div className="absolute top-0 bottom-0 left-8 w-0.5 transform bg-slate-200 md:left-1/2 md:-translate-x-px dark:bg-slate-700"></div>

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <div
                key={exp.company}
                className={`relative transition-all duration-1000 ${
                  mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${600 + index * 200}ms` }}
              >
                <div className="absolute left-6 z-10 h-4 w-4 transform rounded-full border-4 border-white bg-slate-600 md:left-1/2 md:-translate-x-1/2 dark:border-slate-900 dark:bg-slate-400">
                  {exp.current && (
                    <div className="absolute inset-0 animate-pulse rounded-full bg-green-500"></div>
                  )}
                </div>

                <div
                  className={`ml-16 md:ml-0 ${
                    index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'
                  } md:w-1/2 ${index % 2 === 0 ? 'md:ml-0' : 'md:ml-auto'}`}
                >
                  <div className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
                    <div
                      className={`mb-6 flex items-center gap-4 ${
                        index % 2 === 0 ? 'md:flex-row-reverse' : ''
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700">
                          <Image
                            src={exp.logo}
                            alt={t('logoAlt', { company: exp.company })}
                            width={48}
                            height={48}
                            className="h-16 w-16 object-cover"
                            quality={100}
                          />
                        </div>
                      </div>

                      <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                        <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                          {exp.position}
                        </h3>
                        <p className="mb-2 text-lg font-semibold text-slate-600 dark:text-slate-400">
                          {exp.company}
                        </p>

                        <div
                          className={`flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-500 ${
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
                                index % 2 === 0 ? 'md:rotate-180' : ''
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
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
