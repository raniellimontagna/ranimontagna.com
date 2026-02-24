import { Phone } from '@solar-icons/react/ssr'
import type { ComponentType, SVGProps } from 'react'
import { GithubIcon, LinkedinIcon } from '@/shared/components/icons/brands'

// Create a custom mail icon
function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-label="Email"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

export interface SocialLink {
  name: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  external: boolean
  ariaLabel?: string
  direct?: string
}

export const socialLinks = {
  github: {
    name: 'GitHub',
    href: 'https://github.com/RanielliMontagna',
    icon: GithubIcon,
    external: true,
    ariaLabel: 'GitHub Profile - Ranielli Montagna',
  },
  linkedin: {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/rannimontagna',
    icon: LinkedinIcon,
    external: true,
    ariaLabel: 'LinkedIn Profile - Ranielli Montagna',
  },
  email: {
    name: 'Email',
    direct: 'contato@ranimontagna.com',
    href: '#contact',
    icon: MailIcon,
    external: false,
    ariaLabel: 'Send email to Ranielli Montagna',
  },
} as const

export function openEmailClient() {
  if (typeof window === 'undefined') return

  const emailUser = 'contato'
  const emailDomain = 'ranimontagna.com'
  window.location.href = `mailto:${emailUser}@${emailDomain}`
}

const resumeLinks = {
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

export const getResumeByLocale = (locale: 'en' | 'pt' | 'es') => {
  return resumeLinks[locale as keyof typeof resumeLinks] || resumeLinks.en
}

export const getSocialLinksAsArray = (): (SocialLink & { id: string })[] => {
  return Object.entries(socialLinks).map(([id, link]) => ({ ...link, id }))
}
