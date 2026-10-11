import type { AbstractIntlMessages } from 'next-intl'

export const CLIENT_MESSAGE_NAMESPACES = {
  shell: ['notFound'],
  // About, experience, projects, services and footer render as server
  // components; only the header controls, contact form, ⌘K menu and chat
  // translate on the client. Every extra namespace is parsed during hydration.
  home: ['header', 'contact', 'commandMenu', 'chat'],
  projects: ['header', 'projectsPage'],
  blog: ['header', 'blog'],
} as const satisfies Record<string, readonly string[]>

export type ClientMessageScope = keyof typeof CLIENT_MESSAGE_NAMESPACES
type MessageCatalog = Readonly<Record<string, unknown>>

function isClientMessageScope(scope: string): scope is ClientMessageScope {
  return Object.hasOwn(CLIENT_MESSAGE_NAMESPACES, scope)
}

export function getClientMessages(messages: MessageCatalog, scope: string): AbstractIntlMessages {
  if (!isClientMessageScope(scope)) {
    throw new Error(`Unknown client message scope "${scope}"`)
  }

  const result: Record<string, unknown> = {}

  for (const namespace of CLIENT_MESSAGE_NAMESPACES[scope]) {
    const value = messages[namespace]

    if (value === undefined) {
      throw new Error(`Missing client message namespace "${namespace}" for scope "${scope}"`)
    }

    result[namespace] = value
  }

  // Catalogs already pass through next-intl's request config. The cast is
  // localized here because the project also uses arrays via `t.raw()`.
  return result as AbstractIntlMessages
}
