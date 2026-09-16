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
    title: 'Ranielli Montagna - Software Engineer · Co-founder of Atto',
    description:
      'Ranielli Montagna is a software engineer at Lemon Energia and co-founder of Atto (custom software and marketing), from Brazil, with 5+ years in React, React Native, Node.js, TypeScript, automation and applied AI.',
    keywords:
      'Ranielli Montagna, Ranielli, Rani Montagna, full stack software engineer, full stack developer, software engineer, react developer, react native developer, nextjs developer, nodejs developer, typescript developer, frontend developer, backend developer, micro frontends, REST APIs, design system, CI/CD, testing, accessibility, AI automation, brazil developer, ranimontagna',
    ogTitle: 'Ranielli Montagna - Software Engineer · Co-founder of Atto',
    ogDescription:
      'Software engineer at Lemon Energia and co-founder of Atto. Scalable web and mobile products, automation and applied AI with React, React Native, Node.js and TypeScript.',
    twitterTitle: 'Ranielli Montagna - Software Engineer · Co-founder of Atto',
    twitterDescription:
      'Software engineer at Lemon Energia and co-founder of Atto, from Brazil. React, React Native, Node.js, TypeScript and applied AI.',
  },
  pt: {
    title: 'Ranielli Montagna - Engenheiro de Software · Sócio-fundador da Atto',
    description:
      'Ranielli Montagna é engenheiro de software na Lemon Energia e sócio-fundador da Atto (software sob medida e marketing), do Brasil, com 5+ anos em React, React Native, Node.js, TypeScript, automação e IA aplicada.',
    keywords:
      'Ranielli Montagna, Ranielli, Rani Montagna, engenheiro de software full stack, desenvolvedor full stack, engenheiro de software, desenvolvedor react, desenvolvedor react native, desenvolvedor nextjs, desenvolvedor nodejs, typescript, desenvolvedor frontend, desenvolvedor backend, micro frontends, APIs REST, design system, CI/CD, testes, acessibilidade, automação IA, desenvolvedor brasil, ranimontagna',
    ogTitle: 'Ranielli Montagna - Engenheiro de Software · Sócio-fundador da Atto',
    ogDescription:
      'Engenheiro de software na Lemon Energia e sócio-fundador da Atto. Produtos web e mobile escaláveis, automação e IA aplicada com React, React Native, Node.js e TypeScript.',
    twitterTitle: 'Ranielli Montagna - Engenheiro de Software · Sócio-fundador da Atto',
    twitterDescription:
      'Engenheiro de software na Lemon Energia e sócio-fundador da Atto, do Brasil. React, React Native, Node.js, TypeScript e IA aplicada.',
  },
  es: {
    title: 'Ranielli Montagna - Ingeniero de Software · Cofundador de Atto',
    description:
      'Ranielli Montagna es ingeniero de software en Lemon Energia y cofundador de Atto (software a medida y marketing), de Brasil, con más de 5 años en React, React Native, Node.js, TypeScript, automatización e IA aplicada.',
    keywords:
      'Ranielli Montagna, Ranielli, Rani Montagna, ingeniero de software full stack, desarrollador full stack, ingeniero de software, desarrollador react, desarrollador react native, desarrollador nextjs, desarrollador nodejs, typescript, desarrollador frontend, desarrollador backend, micro frontends, APIs REST, design system, CI/CD, pruebas, accesibilidad, automatización IA, desarrollador brasil, ranimontagna',
    ogTitle: 'Ranielli Montagna - Ingeniero de Software · Cofundador de Atto',
    ogDescription:
      'Ingeniero de software en Lemon Energia y cofundador de Atto. Productos web y móviles escalables, automatización e IA aplicada con React, React Native, Node.js y TypeScript.',
    twitterTitle: 'Ranielli Montagna - Ingeniero de Software · Cofundador de Atto',
    twitterDescription:
      'Ingeniero de software en Lemon Energia y cofundador de Atto, de Brasil. React, React Native, Node.js, TypeScript e IA aplicada.',
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
