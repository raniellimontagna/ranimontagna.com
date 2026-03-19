export type ProjectType = {
  id: number
  slug: string
  i18nKey: string
  image: string
  technologies: string[]
  github: string
  demo: string | null
  type: 'mobile' | 'web' | 'desktop'
  featured: boolean
  title: string
  description: string
  role: 'fullstack' | 'frontend' | 'backend'
  year: number
  company: string
  category: 'saas' | 'enterprise'
  highlights: string[]
  integrations: string[]
}

export type ProjectCardProps = {
  project: ProjectType
  animationDelay: string
  priority?: boolean
}
