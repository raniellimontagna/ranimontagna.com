import { ForwardRefExoticComponent, RefAttributes } from 'react'
import { Github, Linkedin, LucideProps, Mail, Phone } from 'lucide-react'

export interface SocialLink {
  id: string
  name: string
  href: string
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
  external: boolean
  ariaLabel?: string
}

export const socialLinks: SocialLink[] = [
  {
    id: 'github',
    name: 'GitHub',
    href: 'https://github.com/RanielliMontagna',
    icon: Github,
    external: true,
    ariaLabel: 'GitHub Profile - Ranielli Montagna',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/rannimontagna',
    icon: Linkedin,
    external: true,
    ariaLabel: 'LinkedIn Profile - Ranielli Montagna',
  },
  {
    id: 'email',
    name: 'Email',
    href: 'mailto:raniellimontagna@hotmail.com',
    icon: Mail,
    external: false,
    ariaLabel: 'Send email to Ranielli Montagna',
  },
]

export const contactMethods: SocialLink[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    href: 'https://wa.me/5554999790871',
    icon: Phone,
    external: true,
    ariaLabel: 'WhatsApp - Ranielli Montagna',
  },
]

export const getSocialLink = (id: string): SocialLink | undefined => {
  return socialLinks.find((link) => link.id === id)
}

export const getExternalSocialLinks = (): SocialLink[] => {
  return socialLinks.filter((link) => link.external)
}

export const getGitHubUrl = (): string => {
  return getSocialLink('github')?.href || ''
}

export const getLinkedInUrl = (): string => {
  return getSocialLink('linkedin')?.href || ''
}

export const getEmailUrl = (): string => {
  return getSocialLink('email')?.href || ''
}

export const getContactMethod = (id: string): SocialLink | undefined => {
  return contactMethods.find((method) => method.id === id)
}

export const getWhatsAppUrl = (): string => {
  return getContactMethod('whatsapp')?.href || ''
}
