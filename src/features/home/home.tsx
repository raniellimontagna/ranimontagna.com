import type React from 'react'
import { HomeSections } from './components/deferred-home-sections'
import { HomeClientWidgets } from './components/home-client-widgets'

interface HomeProps {
  headerContent?: React.ReactNode
  heroContent: React.ReactNode
  introContent?: React.ReactNode
}

export const Home = ({
  headerContent,
  heroContent,
  introContent,
}: HomeProps): React.ReactElement => {
  return (
    <>
      {headerContent}
      <main id="main-content" tabIndex={-1}>
        {heroContent}
        {introContent}
        <HomeSections />
      </main>
      <HomeClientWidgets />
    </>
  )
}
