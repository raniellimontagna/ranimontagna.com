import { routing } from '@/shared/config/i18n/routing'
import { BASE_URL } from './constants'

export interface SEOData {
  title: string
  description: string
  keywords: string
  ogTitle: string
  ogDescription: string
  twitterTitle: string
  twitterDescription: string
}

const seoData: Record<string, SEOData> = {
  en: {
    title: 'Ranielli Montagna - Full Stack Developer',
    description:
      'Ranielli Montagna is a Full Stack Developer from Brazil specializing in React, Next.js, Node.js and TypeScript. Portfolio, blog articles and open source projects.',
    keywords:
      'Ranielli Montagna, Ranielli, Rani Montagna, full stack developer, react developer, nextjs developer, nodejs developer, typescript developer, ui/ux designer, portfolio, frontend developer, backend developer, web developer, javascript developer, brazil developer, ranimontagna',
    ogTitle: 'Ranielli Montagna - Full Stack Developer',
    ogDescription:
      'Ranielli Montagna is a Full Stack Developer from Brazil specializing in React, Next.js, Node.js and TypeScript. Explore the portfolio, blog and projects.',
    twitterTitle: 'Ranielli Montagna - Full Stack Developer',
    twitterDescription:
      'Ranielli Montagna is a Full Stack Developer from Brazil specializing in React, Next.js, Node.js and TypeScript.',
  },
  pt: {
    title: 'Ranielli Montagna - Desenvolvedor Full Stack',
    description:
      'Ranielli Montagna é um Desenvolvedor Full Stack do Brasil especializado em React, Next.js, Node.js e TypeScript. Portfolio, artigos no blog e projetos open source.',
    keywords:
      'Ranielli Montagna, Ranielli, Rani Montagna, desenvolvedor full stack, desenvolvedor react, desenvolvedor nextjs, desenvolvedor nodejs, typescript, ui/ux designer, portfolio, desenvolvedor frontend, desenvolvedor backend, desenvolvedor web, desenvolvedor javascript, desenvolvedor brasil, ranimontagna',
    ogTitle: 'Ranielli Montagna - Desenvolvedor Full Stack',
    ogDescription:
      'Ranielli Montagna é um Desenvolvedor Full Stack do Brasil especializado em React, Next.js, Node.js e TypeScript. Explore o portfolio, blog e projetos.',
    twitterTitle: 'Ranielli Montagna - Desenvolvedor Full Stack',
    twitterDescription:
      'Ranielli Montagna é um Desenvolvedor Full Stack do Brasil especializado em React, Next.js, Node.js e TypeScript.',
  },
  es: {
    title: 'Ranielli Montagna - Desarrollador Full Stack',
    description:
      'Ranielli Montagna es un Desarrollador Full Stack de Brasil especializado en React, Next.js, Node.js y TypeScript. Portfolio, artículos del blog y proyectos open source.',
    keywords:
      'Ranielli Montagna, Ranielli, Rani Montagna, desarrollador full stack, desarrollador react, desarrollador nextjs, desarrollador nodejs, typescript, ui/ux designer, portfolio, desarrollador frontend, desarrollador backend, desarrollador web, desarrollador javascript, desarrollador brasil, ranimontagna',
    ogTitle: 'Ranielli Montagna - Desarrollador Full Stack',
    ogDescription:
      'Ranielli Montagna es un Desarrollador Full Stack de Brasil especializado en React, Next.js, Node.js y TypeScript. Explora el portfolio, blog y proyectos.',
    twitterTitle: 'Ranielli Montagna - Desarrollador Full Stack',
    twitterDescription:
      'Ranielli Montagna es un Desarrollador Full Stack de Brasil especializado en React, Next.js, Node.js y TypeScript.',
  },
}

export function getSEOData(locale: string): SEOData {
  return seoData[locale] || seoData.en
}

export function getAlternateLanguages() {
  const alternates = routing.locales.reduce(
    (acc, lang) => {
      // Default locale points to root
      if (lang === routing.defaultLocale) {
        acc[lang] = BASE_URL
      } else {
        acc[lang] = `${BASE_URL}/${lang}`
      }
      return acc
    },
    {} as Record<string, string>,
  )

  alternates['x-default'] = BASE_URL

  return alternates
}

export function getCanonicalUrl(locale: string): string {
  // Default locale points to root domain
  if (locale === routing.defaultLocale) {
    return BASE_URL
  }
  return `${BASE_URL}/${locale}`
}
