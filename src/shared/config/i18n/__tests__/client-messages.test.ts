import enMessages from '../../../../../messages/en.json'
import esMessages from '../../../../../messages/es.json'
import ptMessages from '../../../../../messages/pt.json'
import {
  type ClientMessageScope,
  CLIENT_MESSAGE_NAMESPACES,
  getClientMessages,
} from '../client-messages'

const catalogs = {
  en: enMessages,
  es: esMessages,
  pt: ptMessages,
}

describe('client message scopes', () => {
  it.each(Object.entries(catalogs))(
    'builds every route scope from the %s catalog',
    (_locale, messages) => {
      for (const scope of Object.keys(CLIENT_MESSAGE_NAMESPACES) as ClientMessageScope[]) {
        expect(Object.keys(getClientMessages(messages, scope))).toEqual([
          ...CLIENT_MESSAGE_NAMESPACES[scope],
        ])
      }
    },
  )

  it('omits server-only and unrelated namespaces from the home payload', () => {
    const messages = getClientMessages(enMessages, 'home')

    expect(messages).not.toHaveProperty('accessibility')
    expect(messages).not.toHaveProperty('hero')
    expect(messages).not.toHaveProperty('blog')
    expect(messages).not.toHaveProperty('projectsPage')
    expect(Object.keys(messages)).toEqual([...CLIENT_MESSAGE_NAMESPACES.home])
  })

  it('fails immediately when a required client namespace is missing', () => {
    expect(() => getClientMessages({ notFound: {} }, 'home')).toThrow(
      'Missing client message namespace "header" for scope "home"',
    )
  })

  it('rejects an unknown route scope', () => {
    expect(() => getClientMessages(enMessages, 'account')).toThrow(
      'Unknown client message scope "account"',
    )
  })
})
