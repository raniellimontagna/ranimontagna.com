'use client'

import { type ComponentType, useCallback, useEffect, useRef, useState } from 'react'
import { SectionTransition } from '@/shared/components/animations'

export const LOAD_HOME_SECTIONS_EVENT = 'home-sections:load'
export const HOME_SECTIONS_READY_EVENT = 'home-sections:ready'

type DeferredSections = {
  About: ComponentType
  Skills: ComponentType
  Experience: ComponentType
  Projects: ComponentType
  Services: ComponentType
  Contact: ComponentType
  Footer: ComponentType
}

export function DeferredHomeSections() {
  const [sections, setSections] = useState<DeferredSections | null>(null)
  const loadPromiseRef = useRef<Promise<void> | null>(null)

  const loadSections = useCallback(() => {
    if (loadPromiseRef.current) return

    loadPromiseRef.current = Promise.all([
      import('@/features/home/components/about/about'),
      import('@/features/home/components/skills/skills'),
      import('@/features/home/components/experience/experience'),
      import('@/features/home/components/projects/projects'),
      import('@/features/home/components/services/services'),
      import('@/features/home/components/contact/contact'),
      import('@/shared/components/layout/footer/footer'),
    ]).then(([about, skills, experience, projects, services, contact, footer]) => {
      setSections({
        About: about.About,
        Skills: skills.Skills,
        Experience: experience.Experience,
        Projects: projects.Projects,
        Services: services.Services,
        Contact: contact.Contact,
        Footer: footer.Footer,
      })
    })
  }, [])

  useEffect(() => {
    if (sections) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      loadSections()
    }

    window.addEventListener(LOAD_HOME_SECTIONS_EVENT, loadSections, { once: true })
    window.addEventListener('pointerdown', loadSections, { once: true, passive: true })
    window.addEventListener('touchstart', loadSections, { once: true, passive: true })
    window.addEventListener('wheel', loadSections, { once: true, passive: true })
    window.addEventListener('scroll', loadSections, { once: true, passive: true })
    window.addEventListener('keydown', handleKeyDown, { once: true })

    return () => {
      window.removeEventListener(LOAD_HOME_SECTIONS_EVENT, loadSections)
      window.removeEventListener('pointerdown', loadSections)
      window.removeEventListener('touchstart', loadSections)
      window.removeEventListener('wheel', loadSections)
      window.removeEventListener('scroll', loadSections)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [loadSections, sections])

  useEffect(() => {
    if (sections) {
      window.dispatchEvent(new Event(HOME_SECTIONS_READY_EVENT))
    }
  }, [sections])

  if (!sections) {
    return <div aria-hidden="true" className="h-px" />
  }

  const { About, Skills, Experience, Projects, Services, Contact, Footer } = sections

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
