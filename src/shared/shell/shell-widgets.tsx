'use client'

import { type ComponentType, useCallback, useEffect, useRef, useState } from 'react'
import { ALTAIR_OPEN_EVENT, openAltair } from '@/shared/lib/altair-events'
import { useChat } from '@/shared/store/use-chat/use-chat'

type ChatWidgetComponent = ComponentType<{ hideLauncher?: boolean }>

const loadDefaultChatWidget = (): Promise<ChatWidgetComponent> =>
  import('@/shared/components/ui/chat-widget/chat-widget').then(({ ChatWidget }) => ChatWidget)

/**
 * Wires the assistant on every page: ⌘K or Ctrl+K asks for it, and
 * `altair:open` loads the chat lazily and opens it. Phase 3 swaps the chat
 * for the Altair panel behind the same event.
 */
export function ShellWidgets({
  loadChatWidget = loadDefaultChatWidget,
}: {
  loadChatWidget?: () => Promise<ChatWidgetComponent>
}) {
  const [ChatWidget, setChatWidget] = useState<ChatWidgetComponent | null>(null)
  const loading = useRef<Promise<void> | null>(null)
  const setChatOpen = useChat((state) => state.setOpen)

  const openChat = useCallback(() => {
    loading.current ??= loadChatWidget().then((Loaded) => setChatWidget(() => Loaded))
    setChatOpen(true)
  }, [loadChatWidget, setChatOpen])

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k' || (!event.metaKey && !event.ctrlKey)) return
      event.preventDefault()
      openAltair()
    }
    window.addEventListener(ALTAIR_OPEN_EVENT, openChat)
    document.addEventListener('keydown', onShortcut)
    return () => {
      window.removeEventListener(ALTAIR_OPEN_EVENT, openChat)
      document.removeEventListener('keydown', onShortcut)
    }
  }, [openChat])

  return ChatWidget ? <ChatWidget hideLauncher /> : null
}
