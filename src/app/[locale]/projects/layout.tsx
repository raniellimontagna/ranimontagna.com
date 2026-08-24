import { ProjectsHeader } from '@/features/projects/components'

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProjectsHeader />
      <main id="main-content" tabIndex={-1} className="min-h-screen pt-16">
        {children}
      </main>
    </>
  )
}
