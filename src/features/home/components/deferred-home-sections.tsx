import { SectionTransition } from '@/shared/components/animations'
import { Footer } from '@/shared/components/layout/footer/footer'
import { About } from './about/about'
import { Contact } from './contact/contact'
import { Experience } from './experience/experience'
import { Projects } from './projects/projects'
import { Services } from './services/services'
import { Skills } from './skills/skills'

/**
 * Essential portfolio content stays in the initial server tree. The individual
 * sections retain their small client islands for animation and interaction,
 * while content-visibility on SectionTransition avoids unnecessary below-fold
 * rendering work without removing navigation targets from the DOM.
 */
export function HomeSections() {
  return (
    <>
      <SectionTransition>
        <About />
      </SectionTransition>
      <Skills />
      <SectionTransition>
        <Experience />
      </SectionTransition>
      <SectionTransition>
        <Projects />
      </SectionTransition>
      <SectionTransition>
        <Services />
      </SectionTransition>
      <SectionTransition>
        <Contact />
      </SectionTransition>
      <Footer />
    </>
  )
}
