import type React from 'react'

interface HomeProps {
  heroContent: React.ReactNode
  bodyContent: React.ReactNode
}

export const Home = ({ heroContent, bodyContent }: HomeProps): React.ReactElement => {
  return (
    <main id="main-content" tabIndex={-1}>
      {heroContent}
      {bodyContent}
    </main>
  )
}
