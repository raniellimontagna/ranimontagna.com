import { Github, Linkedin, type LucideProps, Mail, Phone } from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'

export interface SocialLink {
  name: string
  href: string
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
  external: boolean
  ariaLabel?: string
}

export interface ResumeLink {
  name: string
  href: string
  filename: string
  language: string
  locale: string
}

export const socialLinks = {
  github: {
    name: 'GitHub',
    href: 'https://github.com/RanielliMontagna',
    icon: Github,
    external: true,
    ariaLabel: 'GitHub Profile - Ranielli Montagna',
  },
  linkedin: {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/rannimontagna',
    icon: Linkedin,
    external: true,
    ariaLabel: 'LinkedIn Profile - Ranielli Montagna',
  },
  email: {
    name: 'Email',
    direct: 'raniellimontagna@hotmail.com',
    href: 'mailto:raniellimontagna@hotmail.com',
    icon: Mail,
    external: false,
    ariaLabel: 'Send email to Ranielli Montagna',
  },
} as const

/**
 * Resume/CV links configuration
 */
export const resumeLinks = {
  en: {
    name: 'Resume',
    href: '/cv/en.pdf',
    filename: 'Resume-Ranielli-Montagna.pdf',
    language: 'English',
    locale: 'en',
  },
  pt: {
    name: 'Currículo',
    href: '/cv/pt.pdf',
    filename: 'Curriculo-Ranielli-Montagna.pdf',
    language: 'Português',
    locale: 'pt',
  },
  es: {
    name: 'Currículum',
    href: '/cv/es.pdf',
    filename: 'Curriculum-Ranielli-Montagna.pdf',
    language: 'Español',
    locale: 'es',
  },
} as const

export const contactMethods = {
  whatsapp: {
    name: 'WhatsApp',
    href: 'https://wa.me/5554999790871',
    icon: Phone,
    external: true,
    ariaLabel: 'WhatsApp - Ranielli Montagna',
  },
} as const

export const getSocialLink = (id: keyof typeof socialLinks): SocialLink | undefined => {
  return socialLinks[id]
}

export const getExternalSocialLinks = (): SocialLink[] => {
  return Object.values(socialLinks).filter((link) => link.external)
}

export const getGitHubUrl = (): string => {
  return socialLinks.github.href
}

export const getLinkedInUrl = (): string => {
  return socialLinks.linkedin.href
}

export const getEmailUrl = (): string => {
  return socialLinks.email.href
}

export const getContactMethod = (id: keyof typeof contactMethods): SocialLink | undefined => {
  return contactMethods[id]
}

export const getWhatsAppUrl = (): string => {
  return contactMethods.whatsapp.href
}

/**
 * Resume helper functions
 */
export const getResumeByLocale = (locale: 'en' | 'pt' | 'es') => {
  return resumeLinks[locale as keyof typeof resumeLinks] || resumeLinks.en
}

export const getResumeLinksAsArray = () => Object.values(resumeLinks)

export const getResumeUrl = (locale: 'en' | 'pt' | 'es') => {
  return getResumeByLocale(locale).href
}

export const getSocialLinksAsArray = (): (SocialLink & { id: string })[] => {
  return Object.entries(socialLinks).map(([id, link]) => ({ ...link, id }))
}

export const getContactMethodsAsArray = (): (SocialLink & { id: string })[] => {
  return Object.entries(contactMethods).map(([id, method]) => ({ ...method, id }))
}
