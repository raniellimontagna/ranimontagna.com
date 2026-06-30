import type React from 'react'
import { DeferredHomeSections } from './components/deferred-home-sections'
import { HomeClientWidgets } from './components/home-client-widgets'

interface HomeProps {
  headerContent?: React.ReactNode
  heroContent: React.ReactNode
}

export const Home = ({ headerContent, heroContent }: HomeProps): React.ReactElement => {
  return (
    <>
      {headerContent}
      <main>
        {heroContent}
        <DeferredHomeSections />
      </main>
      <HomeClientWidgets />
    </>
  )
}
