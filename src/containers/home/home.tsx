'use client'

import { Footer, Header } from '@/components'
import { About, Contact, Experience, Hero, Projects, Services } from './sections'

export function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
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
