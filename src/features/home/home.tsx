'use client'

import dynamic from 'next/dynamic'
import { Header } from '@/shared'

// Lazy load CommandMenu as it's not needed immediately
const CommandMenu = dynamic(
  () => import('@/shared/components/ui/command-menu/command-menu').then((mod) => mod.CommandMenu),
  { ssr: false },
)

// Lazy load Footer as it's below the fold
const Footer = dynamic(() =>
  import('@/shared/components/layout/footer/footer').then((mod) => mod.Footer),
)

// Lazy load components below the fold to improve LCP
const About = dynamic(() =>
  import('@/features/home/components/about/about').then((mod) => mod.About),
)
const Skills = dynamic(() =>
  import('@/features/home/components/skills/skills').then((mod) => mod.Skills),
)
const Services = dynamic(() =>
  import('@/features/home/components/services/services').then((mod) => mod.Services),
)
const Experience = dynamic(() =>
  import('@/features/home/components/experience/experience').then((mod) => mod.Experience),
)
const Projects = dynamic(() =>
  import('@/features/home/components/projects/projects').then((mod) => mod.Projects),
)
const Contact = dynamic(() =>
  import('@/features/home/components/contact/contact').then((mod) => mod.Contact),
)

interface HomeProps {
  heroContent: React.ReactNode
}

export function Home({ heroContent }: HomeProps) {
  return (
    <>
      <Header />
      <CommandMenu />
      <main>
        {heroContent}
        <About />
        <Skills />
        <Services />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
