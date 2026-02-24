'use client'

import dynamic from 'next/dynamic'
import type React from 'react'
import { Header } from '@/shared'

const CommandMenu = dynamic(
  () => import('@/shared/components/ui/command-menu/command-menu').then((mod) => mod.CommandMenu),
  { ssr: false },
)

const Footer = dynamic(() =>
  import('@/shared/components/layout/footer/footer').then((mod) => mod.Footer),
)

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

export const Home = ({ heroContent }: HomeProps): React.ReactElement => {
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
