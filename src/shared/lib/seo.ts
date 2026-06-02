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
    title: 'Ranielli Montagna - Full Stack Software Engineer',
    description:
      'Ranielli Montagna is a Full Stack Software Engineer from Brazil with 5+ years of experience in React, React Native, Node.js, TypeScript, APIs and micro frontends.',
    keywords:
      'Ranielli Montagna, Ranielli, Rani Montagna, full stack software engineer, full stack developer, software engineer, react developer, react native developer, nextjs developer, nodejs developer, typescript developer, frontend developer, backend developer, micro frontends, REST APIs, design system, CI/CD, testing, accessibility, AI automation, brazil developer, ranimontagna',
    ogTitle: 'Ranielli Montagna - Full Stack Software Engineer',
    ogDescription:
      'Full Stack Software Engineer with experience in scalable web and mobile products, React, React Native, Node.js, TypeScript, APIs and micro frontends.',
    twitterTitle: 'Ranielli Montagna - Full Stack Software Engineer',
    twitterDescription:
      'Full Stack Software Engineer from Brazil specializing in React, React Native, Node.js and TypeScript.',
  },
  pt: {
    title: 'Ranielli Montagna - Engenheiro de Software Full Stack',
    description:
      'Ranielli Montagna é Engenheiro de Software Full Stack do Brasil com 5+ anos de experiência em React, React Native, Node.js, TypeScript, APIs e micro frontends.',
    keywords:
      'Ranielli Montagna, Ranielli, Rani Montagna, engenheiro de software full stack, desenvolvedor full stack, engenheiro de software, desenvolvedor react, desenvolvedor react native, desenvolvedor nextjs, desenvolvedor nodejs, typescript, desenvolvedor frontend, desenvolvedor backend, micro frontends, APIs REST, design system, CI/CD, testes, acessibilidade, automação IA, desenvolvedor brasil, ranimontagna',
    ogTitle: 'Ranielli Montagna - Engenheiro de Software Full Stack',
    ogDescription:
      'Engenheiro de Software Full Stack com experiência em produtos web e mobile escaláveis, React, React Native, Node.js, TypeScript, APIs e micro frontends.',
    twitterTitle: 'Ranielli Montagna - Engenheiro de Software Full Stack',
    twitterDescription:
      'Engenheiro de Software Full Stack do Brasil especializado em React, React Native, Node.js e TypeScript.',
  },
  es: {
    title: 'Ranielli Montagna - Ingeniero de Software Full Stack',
    description:
      'Ranielli Montagna es Ingeniero de Software Full Stack de Brasil con 5+ años de experiencia en React, React Native, Node.js, TypeScript, APIs y micro frontends.',
    keywords:
      'Ranielli Montagna, Ranielli, Rani Montagna, ingeniero de software full stack, desarrollador full stack, ingeniero de software, desarrollador react, desarrollador react native, desarrollador nextjs, desarrollador nodejs, typescript, desarrollador frontend, desarrollador backend, micro frontends, APIs REST, design system, CI/CD, pruebas, accesibilidad, automatización IA, desarrollador brasil, ranimontagna',
    ogTitle: 'Ranielli Montagna - Ingeniero de Software Full Stack',
    ogDescription:
      'Ingeniero de Software Full Stack con experiencia en productos web y móviles escalables, React, React Native, Node.js, TypeScript, APIs y micro frontends.',
    twitterTitle: 'Ranielli Montagna - Ingeniero de Software Full Stack',
    twitterDescription:
      'Ingeniero de Software Full Stack de Brasil especializado en React, React Native, Node.js y TypeScript.',
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
