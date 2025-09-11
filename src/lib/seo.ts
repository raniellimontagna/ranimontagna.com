import { routing } from '@/i18n/routing'

export interface SEOData {
  title: string
  description: string
  keywords: string
  ogTitle: string
  ogDescription: string
  twitterTitle: string
  twitterDescription: string
}

export const seoData: Record<string, SEOData> = {
  en: {
    title: 'Ranielli Montagna - Full Stack Developer',
    description:
      'Portfolio of Ranielli Montagna - Full Stack Developer specializing in React, Next.js, Node.js and modern interface design. Creating exceptional digital experiences.',
    keywords:
      'full stack developer, react, nextjs, nodejs, typescript, ui/ux designer, portfolio, rani montagna, ranielli montagna, ranielli, frontend developer, backend developer, web developer, javascript developer, brazil developer',
    ogTitle: 'Ranielli Montagna - Full Stack Developer',
    ogDescription:
      'Portfolio of Ranielli Montagna - Full Stack Developer specializing in React, Next.js, Node.js and modern interface design.',
    twitterTitle: 'Ranielli Montagna - Full Stack Developer',
    twitterDescription:
      'Portfolio of Ranielli Montagna - Full Stack Developer specializing in React, Next.js, Node.js and modern interface design.',
  },
  pt: {
    title: 'Ranielli Montagna - Desenvolvedor Full Stack',
    description:
      'Portfolio de Ranielli Montagna - Desenvolvedor Full Stack especializado em React, Next.js, Node.js e design de interfaces modernas. Criando experiências digitais excepcionais.',
    keywords:
      'desenvolvedor full stack, react, nextjs, nodejs, typescript, ui/ux designer, portfolio, rani montagna, ranielli montagna, ranielli, desenvolvedor frontend, desenvolvedor backend, desenvolvedor web, desenvolvedor javascript, desenvolvedor brasil',
    ogTitle: 'Ranielli Montagna - Desenvolvedor Full Stack',
    ogDescription:
      'Portfolio de Ranielli Montagna - Desenvolvedor Full Stack especializado em React, Next.js, Node.js e design de interfaces modernas.',
    twitterTitle: 'Ranielli Montagna - Desenvolvedor Full Stack',
    twitterDescription:
      'Portfolio de Ranielli Montagna - Desenvolvedor Full Stack especializado em React, Next.js, Node.js e design de interfaces modernas.',
  },
  es: {
    title: 'Ranielli Montagna - Desarrollador Full Stack',
    description:
      'Portfolio de Ranielli Montagna - Desarrollador Full Stack especializado en React, Next.js, Node.js y diseño de interfaces modernas. Creando experiencias digitales excepcionales.',
    keywords:
      'desarrollador full stack, react, nextjs, nodejs, typescript, ui/ux designer, portfolio, rani montagna, ranielli montagna, ranielli, desarrollador frontend, desarrollador backend, desarrollador web, desarrollador javascript, desarrollador brasil',
    ogTitle: 'Ranielli Montagna - Desarrollador Full Stack',
    ogDescription:
      'Portfolio de Ranielli Montagna - Desarrollador Full Stack especializado en React, Next.js, Node.js y diseño de interfaces modernas.',
    twitterTitle: 'Ranielli Montagna - Desarrollador Full Stack',
    twitterDescription:
      'Portfolio de Ranielli Montagna - Desarrollador Full Stack especializado en React, Next.js, Node.js y diseño de interfaces modernas.',
  },
}

export function getSEOData(locale: string): SEOData {
  return seoData[locale] || seoData.en
}

export function getAlternateLanguages() {
  const alternates = routing.locales.reduce(
    (acc, lang) => {
      acc[lang] = `https://ranimontagna.com/${lang}`
      return acc
    },
    {} as Record<string, string>,
  )

  alternates['x-default'] = `https://ranimontagna.com/${routing.defaultLocale}`

  return alternates
}

export function getCanonicalUrl(locale: string): string {
  return `https://ranimontagna.com/${locale}`
}
