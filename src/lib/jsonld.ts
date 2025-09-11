import { socialLinks } from '@/constants/socialLinks'

interface PersonJsonLd {
  '@context': string
  '@type': string
  name: string
  jobTitle: string
  url: string
  image: string
  sameAs: string[]
  worksFor: {
    '@type': string
    name: string
  }
  knowsAbout: string[]
  email: string
  description: string
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
    jobTitle: jobTitles[locale as keyof typeof jobTitles] || jobTitles.en,
    url: 'https://ranimontagna.com',
    image: 'https://ranimontagna.com/photo.webp',
    sameAs: ['https://github.com/RanielliMontagna', 'https://linkedin.com/in/rannimontagna'],
    worksFor: {
      '@type': 'Organization',
      name: 'Freelancer',
    },
    knowsAbout: [
      'React',
      'Node.js',
      'TypeScript',
      'JavaScript',
      'UI/UX Design',
      'Full Stack Development',
      'Frontend Development',
      'Backend Development',
      'Web Development',
    ],
    email: socialLinks.email.direct,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
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
    url: 'https://ranimontagna.com',
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    author: {
      '@type': 'Person',
      name: 'Ranielli Montagna',
    },
    inLanguage: ['en', 'pt', 'es'],
  }
}
