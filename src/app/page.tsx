import { About, Contact, Experience, Hero, Projects } from '@/components'

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Experience />
      <Projects />
      {/* <GithubStats /> */}
      <Contact />
    </main>
  )
}
