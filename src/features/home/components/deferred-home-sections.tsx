import { Suspense } from 'react'
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
 *
 * Each section sits in its own Suspense boundary. Nothing here suspends, so the
 * server HTML is unchanged, but React hydrates every boundary separately and in
 * time slices after the shell, instead of one long blocking hydration task.
 */
export function HomeSections() {
  return (
    <>
      <Suspense fallback={null}>
        <SectionTransition>
          <About />
        </SectionTransition>
      </Suspense>
      <Suspense fallback={null}>
        <Skills />
      </Suspense>
      <Suspense fallback={null}>
        <SectionTransition>
          <Experience />
        </SectionTransition>
      </Suspense>
      <Suspense fallback={null}>
        <SectionTransition>
          <Projects />
        </SectionTransition>
      </Suspense>
      <Suspense fallback={null}>
        <SectionTransition>
          <Services />
        </SectionTransition>
      </Suspense>
      <Suspense fallback={null}>
        <SectionTransition>
          <Contact />
        </SectionTransition>
      </Suspense>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  )
}
