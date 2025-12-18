'use client'

import dynamic from 'next/dynamic'
import { Header } from '@/components'

// Lazy load CommandMenu as it's not needed immediately
const CommandMenu = dynamic(
  () => import('@/components/ui/command-menu').then((mod) => mod.CommandMenu),
  { ssr: false },
)

// Lazy load Footer as it's below the fold
const Footer = dynamic(() => import('@/components/footer/footer').then((mod) => mod.Footer))

// Lazy load components below the fold to improve LCP
const About = dynamic(() =>
  import('@/containers/home/sections/about/about').then((mod) => mod.About),
)
const Skills = dynamic(() =>
  import('@/containers/home/sections/skills/skills').then((mod) => mod.Skills),
)
const Services = dynamic(() =>
  import('@/containers/home/sections/services/services').then((mod) => mod.Services),
)
const Experience = dynamic(() =>
  import('@/containers/home/sections/experience/experience').then((mod) => mod.Experience),
)
const Projects = dynamic(() =>
  import('@/containers/home/sections/projects/projects').then((mod) => mod.Projects),
)
const Contact = dynamic(() =>
  import('@/containers/home/sections/contact/contact').then((mod) => mod.Contact),
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
