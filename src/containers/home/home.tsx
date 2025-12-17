'use client'

import { Footer, Header } from '@/components'
import { CommandMenu } from '@/components/ui/command-menu'
import { Hero, Projects, Services } from '@/containers/home/sections'
import { About } from '@/containers/home/sections/about/about'
import { Contact } from '@/containers/home/sections/contact/contact'
import { Experience } from '@/containers/home/sections/experience/experience'
import { Skills } from '@/containers/home/sections/skills/skills'

export function Home() {
  return (
    <>
      <Header />
      <CommandMenu />
      <main>
        <Hero />
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
