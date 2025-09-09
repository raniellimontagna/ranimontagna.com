import { describe, it, expect } from 'vitest'

import {
  socialLinks,
  contactMethods,
  getSocialLink,
  getExternalSocialLinks,
  getGitHubUrl,
  getLinkedInUrl,
  getEmailUrl,
  getContactMethod,
  getWhatsAppUrl,
  getSocialLinksAsArray,
  getContactMethodsAsArray,
} from './socialLinks'

describe('Dados e funções de links sociais e de contato', () => {
  it('socialLinks deve ser um objeto com as chaves corretas', () => {
    const keys = Object.keys(socialLinks)
    expect(keys).toEqual(['github', 'linkedin', 'email'])
    expect(socialLinks.github.name).toBe('GitHub')
    expect(socialLinks.linkedin.href).toBe('https://linkedin.com/in/rannimontagna')
  })

  it('contactMethods deve ser um objeto com a chave correta', () => {
    const keys = Object.keys(contactMethods)
    expect(keys).toEqual(['whatsapp'])
    expect(contactMethods.whatsapp.name).toBe('WhatsApp')
  })

  it('getSocialLink deve retornar o link social correto para um ID válido', () => {
    const githubLink = getSocialLink('github')
    expect(githubLink).toBeDefined()
    expect(githubLink?.name).toBe('GitHub')

    const nonExistentLink = getSocialLink('nonExistentId' as never)
    expect(nonExistentLink).toBeUndefined()
  })

  it('getExternalSocialLinks deve retornar apenas os links externos', () => {
    const externalLinks = getExternalSocialLinks()
    expect(externalLinks).toHaveLength(2)
    const externalLinkNames = externalLinks.map((link) => link.name)
    expect(externalLinkNames).toEqual(['GitHub', 'LinkedIn'])
    expect(externalLinks.find((link) => link.name === 'Email')).toBeUndefined()
  })

  it('getGitHubUrl deve retornar a URL do GitHub', () => {
    expect(getGitHubUrl()).toBe('https://github.com/RanielliMontagna')
  })

  it('getLinkedInUrl deve retornar a URL do LinkedIn', () => {
    expect(getLinkedInUrl()).toBe('https://linkedin.com/in/rannimontagna')
  })

  it('getEmailUrl deve retornar a URL do Email', () => {
    expect(getEmailUrl()).toBe('mailto:raniellimontagna@hotmail.com')
  })

  it('getContactMethod deve retornar o método de contato correto para um ID válido', () => {
    const whatsappMethod = getContactMethod('whatsapp')
    expect(whatsappMethod).toBeDefined()
    expect(whatsappMethod?.name).toBe('WhatsApp')

    const nonExistentMethod = getContactMethod('telegram' as never)
    expect(nonExistentMethod).toBeUndefined()
  })

  it('getWhatsAppUrl deve retornar a URL do WhatsApp', () => {
    expect(getWhatsAppUrl()).toBe('https://wa.me/5554999790871')
  })

  it('getSocialLinksAsArray deve converter o objeto socialLinks em um array com IDs', () => {
    const linksArray = getSocialLinksAsArray()
    expect(linksArray).toHaveLength(3)
    expect(linksArray[0].id).toBe('github')
    expect(linksArray[0].name).toBe('GitHub')
    expect(linksArray[2].id).toBe('email')
    expect(linksArray[2].external).toBe(false)
  })

  it('getContactMethodsAsArray deve converter o objeto contactMethods em um array com IDs', () => {
    const methodsArray = getContactMethodsAsArray()
    expect(methodsArray).toHaveLength(1)
    expect(methodsArray[0].id).toBe('whatsapp')
    expect(methodsArray[0].name).toBe('WhatsApp')
  })
})
