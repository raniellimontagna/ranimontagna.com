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
  worksFor: {
    '@type': string
    name: string
  }
  affiliation: {
    '@type': string
    name: string
    url: string
    description: string
  }
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
    en: 'Software engineer at Lemon Energia and co-founder of Atto (custom software and marketing), working with React, React Native, Node.js, TypeScript, automation and applied AI.',
    pt: 'Engenheiro de software na Lemon Energia e sócio-fundador da Atto (software sob medida e marketing), atuando com React, React Native, Node.js, TypeScript, automação e IA aplicada.',
    es: 'Ingeniero de software en Lemon Energia y cofundador de Atto (software a medida y marketing), trabajando con React, React Native, Node.js, TypeScript, automatización e IA aplicada.',
  }

  const jobTitles = {
    en: 'Software Engineer · Co-founder of Atto',
    pt: 'Engenheiro de Software · Sócio-fundador da Atto',
    es: 'Ingeniero de Software · Cofundador de Atto',
  }

  const hasOccupation = {
    en: {
      name: 'Software Engineer',
      description:
        'Builds scalable web and mobile products, APIs and automation with applied AI using React, React Native, Node.js, TypeScript and Next.js; co-founder of Atto, a software house and marketing studio.',
    },
    pt: {
      name: 'Engenheiro de Software',
      description:
        'Constrói produtos web e mobile escaláveis, APIs e automação com IA aplicada usando React, React Native, Node.js, TypeScript e Next.js; sócio-fundador da Atto, software house e marketing.',
    },
    es: {
      name: 'Ingeniero de Software',
      description:
        'Construye productos web y móviles escalables, APIs y automatización con IA aplicada usando React, React Native, Node.js, TypeScript y Next.js; cofundador de Atto, software house y marketing.',
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
      'Ranielli Montagna (also known as Rani Montagna) is a Brazilian software engineer at Lemon Energia and co-founder of Atto, a software house and marketing studio, working with React, React Native, Node.js, TypeScript and applied AI.',
    jobTitle: jobTitles[locale as keyof typeof jobTitles] || jobTitles.en,
    url: BASE_URL,
    image: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/photo.webp`,
      width: 800,
      height: 800,
      caption: 'Ranielli Montagna - Software Engineer and co-founder of Atto',
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
    worksFor: {
      '@type': 'Organization',
      name: 'Lemon Energia',
    },
    affiliation: {
      '@type': 'Organization',
      name: 'Atto',
      url: 'https://attodev.com.br',
      description: 'Software house e marketing',
    },
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
    en: 'Official portfolio and blog of Ranielli Montagna, software engineer from Brazil and co-founder of Atto. Find experience, projects, articles and contact information.',
    pt: 'Portfolio e blog oficial de Ranielli Montagna, engenheiro de software do Brasil e sócio-fundador da Atto. Encontre experiência, projetos, artigos e informações de contato.',
    es: 'Portfolio y blog oficial de Ranielli Montagna, ingeniero de software de Brasil y cofundador de Atto. Encuentra experiencia, proyectos, artículos e información de contacto.',
  }

  const names = {
    en: 'Ranielli Montagna - Software Engineer Portfolio',
    pt: 'Ranielli Montagna - Portfolio de Engenheiro de Software',
    es: 'Ranielli Montagna - Portfolio de Ingeniero de Software',
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
    en: 'Portfolio of Ranielli Montagna - software engineer and co-founder of Atto, working with React, React Native, Node.js, TypeScript, automation and applied AI.',
    pt: 'Portfolio de Ranielli Montagna - engenheiro de software e sócio-fundador da Atto, atuando com React, React Native, Node.js, TypeScript, automação e IA aplicada.',
    es: 'Portfolio de Ranielli Montagna - ingeniero de software y cofundador de Atto, trabajando con React, React Native, Node.js, TypeScript, automatización e IA aplicada.',
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

interface BlogSummaryJsonLdInput {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export function generateBlogJsonLd(input: {
  url: string
  locale: string
  name: string
  description: string
  posts: BlogSummaryJsonLdInput[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${input.url}#blog`,
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: input.locale,
    author: { '@type': 'Person', name: 'Ranielli Montagna', url: BASE_URL },
    publisher: { '@type': 'Person', name: 'Ranielli Montagna', url: BASE_URL },
    blogPost: input.posts.slice(0, 10).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: `${input.url}/${post.slug}`,
      author: { '@type': 'Person', name: 'Ranielli Montagna' },
      keywords: post.tags.join(', '),
    })),
  }
}

export function generateBlogPostingJsonLd(input: {
  url: string
  blogUrl: string
  locale: string
  title: string
  description: string
  date: string
  image: string
  tags: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${input.url}#blogposting`,
    headline: input.title,
    description: input.description,
    image: [input.image],
    datePublished: input.date,
    dateModified: input.date,
    author: { '@type': 'Person', name: 'Ranielli Montagna', url: BASE_URL },
    publisher: {
      '@type': 'Person',
      name: 'Ranielli Montagna',
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo/white.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    isPartOf: {
      '@type': 'Blog',
      '@id': `${input.blogUrl}#blog`,
      name: 'Ranielli Montagna Blog',
      url: input.blogUrl,
    },
    keywords: input.tags.join(', '),
    articleSection: 'Technology',
    inLanguage: input.locale,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: input.blogUrl },
        { '@type': 'ListItem', position: 3, name: input.title, item: input.url },
      ],
    },
  }
}
