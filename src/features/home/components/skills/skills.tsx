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
      className="relative overflow-hidden border-y border-line bg-background py-12"
    >
      <div className="mb-8 text-center">
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.24em] text-muted">
          {t('title')}
        </p>
      </div>

      <InfiniteMarquee speed="slow" pauseOnHover className="[--gap:1rem]">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-2 transition-colors hover:border-foreground/30 hover:bg-surface-strong"
          >
            <skill.icon className="h-5 w-5 text-muted" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{skill.name}</span>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                {skill.category}
              </span>
            </div>
          </div>
        ))}
      </InfiniteMarquee>
    </section>
  )
}
