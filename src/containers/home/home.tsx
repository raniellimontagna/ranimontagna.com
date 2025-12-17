'use client'

import { Footer, Header } from '@/components'
import { CommandMenu } from '@/components/ui/command-menu'
import {
  About,
  Contact,
  Experience,
  Hero,
  Projects,
  Services,
  Skills,
} from '@/containers/home/sections'

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
