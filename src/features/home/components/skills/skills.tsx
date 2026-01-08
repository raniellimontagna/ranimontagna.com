'use client'

import {
  Box,
  BranchingPathsUp,
  Code2,
  Database,
  Figma,
  Global,
  Palette,
  Server,
  Smartphone,
  Widget,
} from '@solar-icons/react/ssr'
import { useTranslations } from 'next-intl'
import { InfiniteMarquee } from '@/shared/components/ui'

const skills = [
  { name: 'React', icon: Global, category: 'Frontend' },
  { name: 'Next.js', icon: Widget, category: 'Fullstack' },
  { name: 'TypeScript', icon: Code2, category: 'Language' },
  { name: 'Node.js', icon: Server, category: 'Backend' },
  { name: 'Tailwind CSS', icon: Palette, category: 'Styling' },
  { name: 'React Native', icon: Smartphone, category: 'Mobile' },
  { name: 'PostgreSQL', icon: Database, category: 'Database' },
  { name: 'Figma', icon: Figma, category: 'UX/Design' },
  { name: 'Docker', icon: Box, category: 'DevOps' },
  { name: 'Git', icon: BranchingPathsUp, category: 'Version Control' },
]

export function Skills() {
  const t = useTranslations('about.skills')

  return (
    <section
      data-testid="skills"
      className="border-y border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t('title')}
        </p>
      </div>

      <InfiniteMarquee speed="slow" pauseOnHover className="[--gap:1rem]">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800"
          >
            <skill.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {skill.name}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {skill.category}
              </span>
            </div>
          </div>
        ))}
      </InfiniteMarquee>
    </section>
  )
}
