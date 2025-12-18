import { ArrowDown } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { TerminalWindow } from '@/components/ui/terminal-window'
import { HeroAnimations, ScrollIndicator } from './hero-content'

export async function Hero() {
  const t = await getTranslations('hero')
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
        <TerminalWindow title="ranielli.dev" className="w-full">
          <div className="flex flex-col gap-6 font-mono">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <span className="text-blue-600 dark:text-blue-400">➜</span>
                <span className="text-purple-600 dark:text-purple-400">~</span>
                <span>whoami</span>
              </div>
              <div className="pl-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                  {t('name')}
                </h1>
                <p className="mt-2 text-lg text-slate-600 sm:text-xl dark:text-slate-400">
                  {t('greeting')}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <span className="text-blue-600 dark:text-blue-400">➜</span>
                <span className="text-purple-600 dark:text-purple-400">~</span>
                <span>cat passion.txt</span>
              </div>
              <div className="max-w-3xl pl-4 text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">
                  {t('passion.part1')}{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {t('passion.highlight')}
                  </span>{' '}
                  {t('passion.part2')}
                </p>
                <p className="mt-2 italic text-slate-500 dark:text-slate-400">
                  &quot;{t('description')}&quot;
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <span className="text-blue-600 dark:text-blue-400">➜</span>
                <span className="text-purple-600 dark:text-purple-400">~</span>
                <span>ls ./skills</span>
              </div>
              <div className="pl-4 pt-2">
                <HeroAnimations skillsList={skillsList} />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <span className="text-blue-600 dark:text-blue-400">➜</span>
                <span className="text-purple-600 dark:text-purple-400">~</span>
                <span className="animate-pulse">_</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 pl-4">
                <a
                  href="#projects"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white transition duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                  <span className="mr-2">./projects.sh</span>
                  <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
                </a>

                <a
                  href="#contact"
                  className="group inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-transparent px-6 py-2.5 font-medium text-slate-600 transition duration-300 hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-200 dark:hover:text-white"
                >
                  <span>./contact.sh</span>
                </a>
              </div>
            </div>
          </div>
        </TerminalWindow>
      </div>

      <ScrollIndicator />
    </section>
  )
}
