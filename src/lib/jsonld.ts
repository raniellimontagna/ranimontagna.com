import { socialLinks } from '@/constants/socialLinks'
import { BASE_URL } from './constants'

interface PersonJsonLd {
  '@context': string
  '@type': string
  name: string
  givenName: string
  familyName: string
  alternateName: string[]
  jobTitle: string
  url: string
  image: string
  sameAs: string[]
  worksFor: {
    '@type': string
    name: string
  }
  alumniOf: {
    '@type': string
    name: string
  }
  knowsAbout: string[]
  email: string
  description: string
  nationality: {
    '@type': string
    name: string
  }
}

interface WebsiteJsonLd {
  '@context': string
  '@type': string
  name: string
  url: string
  description: string
  author: {
    '@type': string
    name: string
  }
  inLanguage: string[]
}

export function generatePersonJsonLd(locale: string): PersonJsonLd {
  const descriptions = {
    en: 'Full Stack Developer specializing in React, Node.js and modern interface design. Creating exceptional digital experiences.',
    pt: 'Desenvolvedor Full Stack especializado em React, Node.js e design de interfaces modernas. Criando experiências digitais excepcionais.',
    es: 'Desarrollador Full Stack especializado en React, Node.js y diseño de interfaces modernas. Creando experiencias digitales excepcionales.',
  }

  const jobTitles = {
    en: 'Full Stack Developer',
    pt: 'Desenvolvedor Full Stack',
    es: 'Desarrollador Full Stack',
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Ranielli Montagna',
    givenName: 'Ranielli',
    familyName: 'Montagna',
    alternateName: ['Rani Montagna', 'Ranni Montagna'],
    jobTitle: jobTitles[locale as keyof typeof jobTitles] || jobTitles.en,
    url: BASE_URL,
    image: `${BASE_URL}/photo.webp`,
    sameAs: [
      'https://github.com/RanielliMontagna',
      'https://linkedin.com/in/rannimontagna',
      'https://twitter.com/rannimontagna',
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'Luizalabs - Magazine Luiza',
    },
    alumniOf: {
      '@type': 'Organization',
      name: 'Smarten',
    },
    knowsAbout: [
      'React',
      'React Native',
      'Node.js',
      'TypeScript',
      'JavaScript',
      'Next.js',
      'UI/UX Design',
      'Full Stack Development',
      'Frontend Development',
      'Backend Development',
      'Web Development',
      'Mobile Development',
    ],
    email: socialLinks.email.direct,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    nationality: {
      '@type': 'Country',
      name: 'Brazil',
    },
  }
}

export function generateWebsiteJsonLd(locale: string): WebsiteJsonLd {
  const descriptions = {
    en: 'Portfolio of Ranielli Montagna - Full Stack Developer specializing in React, Next.js, Node.js and modern interface design.',
    pt: 'Portfolio de Ranielli Montagna - Desenvolvedor Full Stack especializado em React, Next.js, Node.js e design de interfaces modernas.',
    es: 'Portfolio de Ranielli Montagna - Desarrollador Full Stack especializado en React, Next.js, Node.js y diseño de interfaces modernas.',
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Ranielli Montagna Portfolio',
    url: BASE_URL,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    author: {
      '@type': 'Person',
      name: 'Ranielli Montagna',
    },
    inLanguage: ['en', 'pt', 'es'],
  }
}
