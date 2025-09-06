'use client'

import { Header, Footer } from '@/components'
import { About, Contact, Experience, Hero, Projects } from './sections'

export function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        {/* <GithubStats /> */}
        <Contact />
      </main>
      <Footer />
    </>
  )
}
