import { ProjectsHeader } from '@/components/projects'

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProjectsHeader />
      <main className="min-h-screen pt-16">{children}</main>
    </>
  )
}
