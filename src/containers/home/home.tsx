'use client'

import { Footer, Header } from '@/components'
import { CommandMenu } from '@/components/ui/command-menu'
import { About, Contact, Experience, Projects, Services, Skills } from '@/containers/home/sections'

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
