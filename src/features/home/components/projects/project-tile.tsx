import { Buildings, Global, Monitor, Smartphone, SquareArrowRightUp } from '@solar-icons/react/ssr'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { ProjectType } from '@/features/projects/types/projects.types'
import { Link } from '@/shared/config/i18n/navigation'
import { getProjectTechBadgeTone, ProjectBadge, projectTypeBadgeTone } from './project-badge'

const typeIcons = {
  web: Global,
  mobile: Smartphone,
  desktop: Monitor,
}

type ProjectTileProps = {
  project: ProjectType
  priority?: boolean
}

/**
 * Compact project tile for the home grid: one image, one line of context,
 * three technologies. Details live on /projects and on the project itself.
 */
export function ProjectTile({ project, priority = false }: ProjectTileProps) {
  const t = useTranslations('projects')
  const TypeIcon = typeIcons[project.type]
  const href = project.demo || '/projects'
  const external = Boolean(project.demo)
  const technologies = project.technologies.slice(0, 3)

  const body = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-strong">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center glow-gradient-preview">
            <TypeIcon className="h-12 w-12 text-foreground/70" />
          </div>
        )}
        <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2">
          <ProjectBadge
            icon={<TypeIcon className="h-3 w-3" />}
            variant="overlay"
            className={projectTypeBadgeTone[project.type]}
          >
            {project.type}
          </ProjectBadge>
          <ProjectBadge icon={<Buildings className="h-3 w-3" />} variant="overlayMuted">
            {project.company}
          </ProjectBadge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-[-0.04em] text-foreground sm:text-xl">
            {project.title}
          </h3>
          <SquareArrowRightUp className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-muted">{project.description}</p>
        <ul
          className="mt-auto flex flex-wrap gap-1.5 pt-1"
          aria-label={t('card.technologiesLabel')}
        >
          {technologies.map((tech) => (
            <li key={tech}>
              <ProjectBadge typography="label" className={getProjectTechBadgeTone(tech)}>
                {tech}
              </ProjectBadge>
            </li>
          ))}
        </ul>
      </div>
    </>
  )

  const className =
    'group surface-panel flex h-full flex-col overflow-hidden rounded-3xl border border-line transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-card'

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        data-testid="project-tile"
        aria-label={t('card.openProject', { name: project.title })}
      >
        {body}
      </a>
    )
  }

  return (
    <Link href="/projects" className={className} data-testid="project-tile">
      {body}
    </Link>
  )
}
