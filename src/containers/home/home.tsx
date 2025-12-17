'use client'

import { Hero, Projects, Services } from '@/containers/home/sections'
import { About } from '@/containers/home/sections/about/about'
import { Contact } from '@/containers/home/sections/contact/contact'
import { Experience } from '@/containers/home/sections/experience/experience'
import { Skills } from '@/containers/home/sections/skills/skills'

import { CommandMenu } from '@/components/ui/command-menu'
import { Footer, Header } from '@/components'

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
