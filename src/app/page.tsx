import { Hero } from '@/components/hero'
import { About } from '@/components/about'
import { Contact } from '@/components/contact'
import { Projects } from '@/components/projects'
import { Experience } from '@/components/experience'
// import { GitHubStats } from '@/components/gitHubStats'

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Experience />
      <Projects />
      {/* <GitHubStats /> */}
      <Contact />
    </main>
  )
}
