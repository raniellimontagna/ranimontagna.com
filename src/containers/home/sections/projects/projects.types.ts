import type { ComponentType, SVGProps } from 'react'

export type ProjectType = {
  id: number
  i18nKey: string
  image: string
  technologies: string[]
  github: string
  demo: string | null
  type: 'mobile' | 'web' | 'api'
  featured: boolean
  title: string
  description: string
}

export type ProjectCardProps = {
  project: ProjectType
  animationDelay: string
  priority?: boolean
}

export type FilterType = {
  id: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}
