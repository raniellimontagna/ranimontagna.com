import type React from 'react'
import { HomeSections } from './components/deferred-home-sections'

interface HomeProps {
  heroContent: React.ReactNode
  introContent?: React.ReactNode
}

export const Home = ({ heroContent, introContent }: HomeProps): React.ReactElement => {
  return (
    <main id="main-content" tabIndex={-1}>
      {heroContent}
      {introContent}
      <HomeSections />
    </main>
  )
}
