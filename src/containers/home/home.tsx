'use client'

import { Footer, Header } from '@/components'
import { About, Contact, Experience, Hero, Projects, Services, Skills } from './sections'

export function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Skills />
        <Services />
        <Experience />
        <Projects />
        {/* <GithubStats /> */}
        <Contact />
      </main>
      <Footer />
    </>
  )
}
