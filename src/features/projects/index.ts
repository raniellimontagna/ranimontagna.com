// Projects feature exports - Components
export { CTASection } from './components/cta-section'
export { FeaturedProject } from './components/featured-project'
export { GitHubStats } from './components/github-stats'
export { LanguageFilter } from './components/language-filter'
export { ProjectCard } from './components/project-card'
export { ProjectsHeader } from './components/projects-header'
export { ProjectsList } from './components/projects-list'
// Projects data
export { projectsData } from './data/projects.static'
export type { GitHubStats as GitHubStatsData, Repository } from './lib/github'
// Projects lib - explicitly export functions/interfaces with unique names
export {
  getFeaturedRepositories,
  getGitHubStats,
  getLanguagesFromRepos,
  getRegularRepositories,
  LANGUAGE_COLORS,
} from './lib/github'

// Projects types
export type { ProjectType } from './types/projects.types'
