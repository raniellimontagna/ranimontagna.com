'use client'

import { InfiniteMarquee } from '@/components/ui/infinite-marquee'
import {
  Code2,
  Container,
  Database,
  Figma,
  GitBranch,
  Globe,
  Layout,
  Palette,
  Server,
  Smartphone,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

const skills = [
  { name: 'React', icon: Globe, category: 'Frontend' },
  { name: 'Next.js', icon: Layout, category: 'Fullstack' },
  { name: 'TypeScript', icon: Code2, category: 'Language' },
  { name: 'Node.js', icon: Server, category: 'Backend' },
  { name: 'Tailwind CSS', icon: Palette, category: 'Styling' },
  { name: 'React Native', icon: Smartphone, category: 'Mobile' },
  { name: 'PostgreSQL', icon: Database, category: 'Database' },
  { name: 'Figma', icon: Figma, category: 'UX/Design' },
  { name: 'Docker', icon: Container, category: 'DevOps' },
  { name: 'Git', icon: GitBranch, category: 'Version Control' },
]

export function Skills() {
  const t = useTranslations('about.skills')

  return (
    <section className="border-y border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-950">
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
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-500">
                {skill.category}
              </span>
            </div>
          </div>
        ))}
      </InfiniteMarquee>
    </section>
  )
}
