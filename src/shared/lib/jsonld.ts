import { socialLinks } from '@/shared/lib/socialLinks'
import { BASE_URL } from './constants'

interface PersonJsonLd {
  '@context': string
  '@type': string
  '@id': string
  name: string
  givenName: string
  familyName: string
  alternateName: string[]
  disambiguatingDescription: string
  jobTitle: string
  url: string
  image: {
    '@type': string
    url: string
    width: number
    height: number
    caption: string
  }
  sameAs: string[]
  worksFor: {
    '@type': string
    name: string
    url: string
  }
  alumniOf: {
    '@type': string
    name: string
  }
  hasOccupation: {
    '@type': string
    name: string
    description: string
    skills: string
    occupationLocation: { '@type': string; name: string }
  }
  knowsAbout: string[]
  knowsLanguage: { '@type': string; name: string }[]
  email: string
  description: string
  nationality: {
    '@type': string
    name: string
  }
  address: {
    '@type': string
    addressLocality: string
    addressRegion: string
    addressCountry: string
  }
  mainEntityOfPage: {
    '@type': string
    '@id': string
  }
  identifier: {
    '@type': string
    propertyID: string
    value: string
  }[]
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
    '@id': string
  }
  inLanguage: string[]
}

export interface ProfilePageJsonLd {
  '@context': string
  '@type': string
  '@id': string
  name: string
  url: string
  mainEntity: {
    '@type': string
    '@id': string
    name: string
  }
  description: string
  about: {
    '@type': string
    '@id': string
  }
  breadcrumb: {
    '@type': string
    itemListElement: { '@type': string; position: number; name: string; item: string }[]
  }
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

  const hasOccupation = {
    en: {
      name: 'Full Stack Developer',
      description:
        'Develops web and mobile applications using React, Node.js, TypeScript and Next.js.',
    },
    pt: {
      name: 'Desenvolvedor Full Stack',
      description:
        'Desenvolve aplicações web e mobile utilizando React, Node.js, TypeScript e Next.js.',
    },
    es: {
      name: 'Desarrollador Full Stack',
      description:
        'Desarrolla aplicaciones web y móviles usando React, Node.js, TypeScript y Next.js.',
    },
  }

  const occ = hasOccupation[locale as keyof typeof hasOccupation] || hasOccupation.en

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${BASE_URL}/#person`,
    name: 'Ranielli Montagna',
    givenName: 'Ranielli',
    familyName: 'Montagna',
    alternateName: ['Rani Montagna', 'Ranni Montagna', 'Ranielli'],
    disambiguatingDescription:
      'Ranielli Montagna (also known as Rani Montagna) is a Brazilian Full Stack Developer specializing in React, Next.js, Node.js and TypeScript.',
    jobTitle: jobTitles[locale as keyof typeof jobTitles] || jobTitles.en,
    url: BASE_URL,
    image: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/photo.webp`,
      width: 800,
      height: 800,
      caption: 'Ranielli Montagna - Full Stack Developer',
    },
    sameAs: [
      'https://github.com/RanielliMontagna',
      'https://linkedin.com/in/rannimontagna',
      'https://twitter.com/rannimontagna',
      'https://x.com/rannimontagna',
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'Luizalabs - Magazine Luiza',
      url: 'https://luizalabs.com',
    },
    alumniOf: {
      '@type': 'Organization',
      name: 'Smarten',
    },
    hasOccupation: {
      '@type': 'Occupation',
      name: occ.name,
      description: occ.description,
      skills: 'React, Next.js, Node.js, TypeScript, JavaScript, React Native, UI/UX Design',
      occupationLocation: {
        '@type': 'Country',
        name: 'Brazil',
      },
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
      'Software Engineering',
      'REST APIs',
      'GraphQL',
      'PostgreSQL',
      'Tailwind CSS',
    ],
    knowsLanguage: [
      { '@type': 'Language', name: 'Portuguese' },
      { '@type': 'Language', name: 'English' },
    ],
    email: socialLinks.email.direct,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    nationality: {
      '@type': 'Country',
      name: 'Brazil',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Brazil',
      addressRegion: 'BR',
      addressCountry: 'BR',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': BASE_URL,
    },
    identifier: [
      {
        '@type': 'PropertyValue',
        propertyID: 'GitHub',
        value: 'RanielliMontagna',
      },
      {
        '@type': 'PropertyValue',
        propertyID: 'LinkedIn',
        value: 'rannimontagna',
      },
      {
        '@type': 'PropertyValue',
        propertyID: 'Twitter',
        value: 'rannimontagna',
      },
    ],
  }
}

export function generateProfilePageJsonLd(locale: string): ProfilePageJsonLd {
  const descriptions = {
    en: 'Official portfolio and blog of Ranielli Montagna, Full Stack Developer from Brazil. Find articles, projects and contact information.',
    pt: 'Portfolio e blog oficial de Ranielli Montagna, Desenvolvedor Full Stack do Brasil. Encontre artigos, projetos e informações de contato.',
    es: 'Portfolio y blog oficial de Ranielli Montagna, Desarrollador Full Stack de Brasil. Encuentra artículos, proyectos e información de contacto.',
  }

  const names = {
    en: 'Ranielli Montagna - Full Stack Developer Portfolio',
    pt: 'Ranielli Montagna - Portfolio de Desenvolvedor Full Stack',
    es: 'Ranielli Montagna - Portfolio de Desarrollador Full Stack',
  }

  const canonicalUrl = locale === 'pt' ? BASE_URL : `${BASE_URL}/${locale}`

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${canonicalUrl}/#profilepage`,
    name: names[locale as keyof typeof names] || names.en,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'Person',
      '@id': `${BASE_URL}/#person`,
      name: 'Ranielli Montagna',
    },
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    about: {
      '@type': 'Person',
      '@id': `${BASE_URL}/#person`,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Ranielli Montagna',
          item: BASE_URL,
        },
      ],
    },
  }
}

export function generateWebsiteJsonLd(locale: string): WebsiteJsonLd & {
  potentialAction: {
    '@type': string
    target: { '@type': string; urlTemplate: string }
    'query-input': string
  }
} {
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
      '@id': `${BASE_URL}/#person`,
    },
    inLanguage: ['en', 'pt', 'es'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
