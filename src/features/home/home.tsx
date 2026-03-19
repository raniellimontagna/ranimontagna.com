import type React from 'react'
import { About } from '@/features/home/components/about/about'
import { Contact } from '@/features/home/components/contact/contact'
import { Experience } from '@/features/home/components/experience/experience'
import { Projects } from '@/features/home/components/projects/projects'
import { Services } from '@/features/home/components/services/services'
import { Skills } from '@/features/home/components/skills/skills'
import { Footer, Header } from '@/shared'
import { HomeClientWidgets } from './components/home-client-widgets'

interface HomeProps {
  heroContent: React.ReactNode
}

export const Home = ({ heroContent }: HomeProps): React.ReactElement => {
  return (
    <>
      <Header />
      <main>
        {heroContent}
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Services />
        <Contact />
      </main>
      <Footer />
      <HomeClientWidgets />
    </>
  )
}
