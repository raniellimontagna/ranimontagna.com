import { ForwardRefExoticComponent, RefAttributes } from 'react'
import { Github, Linkedin, LucideProps, Mail, Phone } from 'lucide-react'

export interface SocialLink {
  name: string
  href: string
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
  external: boolean
  ariaLabel?: string
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
    href: 'mailto:raniellimontagna@hotmail.com',
    icon: Mail,
    external: false,
    ariaLabel: 'Send email to Ranielli Montagna',
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

export const getSocialLinksAsArray = (): (SocialLink & { id: string })[] => {
  return Object.entries(socialLinks).map(([id, link]) => ({ ...link, id }))
}

export const getContactMethodsAsArray = (): (SocialLink & { id: string })[] => {
  return Object.entries(contactMethods).map(([id, method]) => ({ ...method, id }))
}
