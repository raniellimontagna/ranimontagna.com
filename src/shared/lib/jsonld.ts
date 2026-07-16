import { socialLinks } from '@/shared/lib/social-links'
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
  alumniOf: {
    '@type': string
    name: string
    url?: string
  }[]
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
  const sameAs = Object.values(socialLinks)
    .filter((link) => link.external)
    .map((link) => link.href)

  const descriptions = {
    en: 'Full Stack Software Engineer specializing in React, React Native, Node.js, TypeScript, APIs and micro frontends.',
    pt: 'Engenheiro de Software Full Stack especializado em React, React Native, Node.js, TypeScript, APIs e micro frontends.',
    es: 'Ingeniero de Software Full Stack especializado en React, React Native, Node.js, TypeScript, APIs y micro frontends.',
  }

  const jobTitles = {
    en: 'Full Stack Software Engineer',
    pt: 'Engenheiro de Software Full Stack',
    es: 'Ingeniero de Software Full Stack',
  }

  const hasOccupation = {
    en: {
      name: 'Full Stack Software Engineer',
      description:
        'Builds scalable web and mobile applications, REST APIs and micro frontends using React, React Native, Node.js, TypeScript and Next.js.',
    },
    pt: {
      name: 'Engenheiro de Software Full Stack',
      description:
        'Constrói aplicações web e mobile escaláveis, APIs REST e micro frontends usando React, React Native, Node.js, TypeScript e Next.js.',
    },
    es: {
      name: 'Ingeniero de Software Full Stack',
      description:
        'Construye aplicaciones web y móviles escalables, APIs REST y micro frontends usando React, React Native, Node.js, TypeScript y Next.js.',
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
      'Ranielli Montagna (also known as Rani Montagna) is a Brazilian Full Stack Software Engineer at Lemon Energia, specializing in React, React Native, Node.js and TypeScript.',
    jobTitle: jobTitles[locale as keyof typeof jobTitles] || jobTitles.en,
    url: BASE_URL,
    image: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/photo.webp`,
      width: 800,
      height: 800,
      caption: 'Ranielli Montagna - Full Stack Software Engineer',
    },
    sameAs: [...sameAs, 'https://x.com/rannimontagna'],
    alumniOf: [
      {
        '@type': 'Organization',
        name: 'Luizalabs - Magazine Luiza',
        url: 'https://luizalabs.com',
      },
      {
        '@type': 'Organization',
        name: 'Smarten',
      },
    ],
    hasOccupation: {
      '@type': 'Occupation',
      name: occ.name,
      description: occ.description,
      skills:
        'React, Next.js, React Native, Node.js, TypeScript, JavaScript, REST APIs, Micro Frontends, Design Systems, CI/CD, Testing, Accessibility, AI Automation',
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
      'Micro Frontends',
      'Software Engineering',
      'REST APIs',
      'GraphQL',
      'PostgreSQL',
      'Tailwind CSS',
      'Design Systems',
      'CI/CD',
      'Testing',
      'Accessibility',
      'AI Automation',
      'Model Context Protocol',
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
      {
        '@type': 'PropertyValue',
        propertyID: 'Instagram',
        value: 'raniellimontagna',
      },
    ],
  }
}

export function generateProfilePageJsonLd(locale: string): ProfilePageJsonLd {
  const descriptions = {
    en: 'Official portfolio and blog of Ranielli Montagna, Full Stack Software Engineer from Brazil. Find experience, projects, articles and contact information.',
    pt: 'Portfolio e blog oficial de Ranielli Montagna, Engenheiro de Software Full Stack do Brasil. Encontre experiência, projetos, artigos e informações de contato.',
    es: 'Portfolio y blog oficial de Ranielli Montagna, Ingeniero de Software Full Stack de Brasil. Encuentra experiencia, proyectos, artículos e información de contacto.',
  }

  const names = {
    en: 'Ranielli Montagna - Full Stack Software Engineer Portfolio',
    pt: 'Ranielli Montagna - Portfolio de Engenheiro de Software Full Stack',
    es: 'Ranielli Montagna - Portfolio de Ingeniero de Software Full Stack',
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
    en: 'Portfolio of Ranielli Montagna - Full Stack Software Engineer specializing in React, React Native, Node.js, TypeScript and scalable product engineering.',
    pt: 'Portfolio de Ranielli Montagna - Engenheiro de Software Full Stack especializado em React, React Native, Node.js, TypeScript e engenharia de produtos escaláveis.',
    es: 'Portfolio de Ranielli Montagna - Ingeniero de Software Full Stack especializado en React, React Native, Node.js, TypeScript e ingeniería de productos escalables.',
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
