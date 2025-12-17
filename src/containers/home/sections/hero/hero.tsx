'use client'

import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'
import { TerminalWindow } from '@/components/ui/terminal-window'
import { TypingEffect } from '@/components/ui/typing-effect'
import { ArrowDown } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'

export function Hero() {
  const t = useTranslations('hero')
  const skillsList = t.raw('skills.list') as string[]

  return (
    <section
      id="start"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 px-4 pt-32 pb-20 sm:px-6 sm:pt-40 sm:pb-24 lg:px-8 dark:bg-gray-950"
      aria-label="Hero section - Ranielli Montagna introduction"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-70 dark:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent dark:from-gray-950" />
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 animate-pulse rounded-full bg-blue-500/10 blur-3xl sm:-top-40 sm:-right-40" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 animate-pulse rounded-full bg-purple-500/10 blur-3xl delay-1000 sm:-bottom-40 sm:-left-40" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <FadeIn delay={0.2}>
          <TerminalWindow title="ranielli.dev" className="w-full">
            <div className="flex flex-col gap-6 font-mono">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-green-400">
                  <span className="text-blue-400">➜</span>
                  <span className="text-purple-400">~</span>
                  <span>whoami</span>
                </div>
                <div className="pl-4">
                  <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    <TypingEffect text={t('name')} duration={1.5} delay={0.5} />
                  </h1>
                  <p className="mt-2 text-lg text-gray-400 sm:text-xl">{t('greeting')}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-green-400">
                  <span className="text-blue-400">➜</span>
                  <span className="text-purple-400">~</span>
                  <span>cat passion.txt</span>
                </div>
                <div className="max-w-3xl pl-4 text-gray-300">
                  <p className="leading-relaxed">
                    {t('passion.part1')}{' '}
                    <span className="text-blue-400">{t('passion.highlight')}</span>{' '}
                    {t('passion.part2')}
                  </p>
                  <p className="mt-2 text-gray-400 italic">
                    {/* {t('description')} */}
                    &quot;{t('description')}&quot;
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-green-400">
                  <span className="text-blue-400">➜</span>
                  <span className="text-purple-400">~</span>
                  <span>ls ./skills</span>
                </div>
                <div className="pl-4 pt-2">
                  <StaggerContainer staggerDelay={0.05}>
                    <div className="flex flex-wrap gap-2">
                      {skillsList.map((tech) => (
                        <StaggerItem key={tech}>
                          <span className="inline-flex items-center rounded border border-gray-700 bg-gray-800/50 px-2 py-1 text-xs font-medium text-blue-300 hover:border-blue-500/50 hover:text-blue-200 transition-colors">
                            {tech}
                          </span>
                        </StaggerItem>
                      ))}
                    </div>
                  </StaggerContainer>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <div className="flex items-center gap-2 text-green-400">
                  <span className="text-blue-400">➜</span>
                  <span className="text-purple-400">~</span>
                  <span className="animate-pulse">_</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 pl-4">
                  <a
                    href="#projects"
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-md bg-blue-600 px-6 py-2 font-medium text-white transition duration-300 hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                  >
                    <span className="mr-2">./projects.sh</span>
                    <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
                  </a>

                  <a
                    href="#contact"
                    className="group inline-flex items-center justify-center rounded-md border border-gray-700 bg-transparent px-6 py-2 font-medium text-gray-300 transition duration-300 hover:border-gray-500 hover:text-white"
                  >
                    <span>./contact.sh</span>
                  </a>
                </div>
              </div>
            </div>
          </TerminalWindow>
        </FadeIn>
      </div>

      <motion.div
        data-testid="scroll-down-indicator"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 transform cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        onClick={() => {
          const section = document.getElementById('about')
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' })
          }
        }}
      >
        <div className="flex flex-col items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
          <span className="animate-pulse">SCROLL</span>
          <ArrowDown className="h-4 w-4 animate-bounce text-gray-500 dark:text-gray-400" />
        </div>
      </motion.div>
    </section>
  )
}
