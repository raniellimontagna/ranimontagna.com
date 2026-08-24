'use client'

import { useTranslations } from 'next-intl'
import { type ComponentType, useCallback, useEffect, useRef, useState } from 'react'
import { ProgressiveGsapAnimations } from '@/shared/components/animations/progressive-gsap-animations'
import { useChat } from '@/shared/store/use-chat/use-chat'
import { useCommandMenu } from '@/shared/store/use-command-menu/use-command-menu'

export function HomeClientWidgets() {
  const [CommandMenu, setCommandMenu] = useState<ComponentType | null>(null)
  const [ChatWidget, setChatWidget] = useState<ComponentType | null>(null)
  const commandLoadPromise = useRef<Promise<void> | null>(null)
  const chatLoadPromise = useRef<Promise<void> | null>(null)
  const t = useTranslations('chat')
  const isCommandMenuOpen = useCommandMenu((state) => state.isOpen)
  const setCommandMenuOpen = useCommandMenu((state) => state.setOpen)
  const setChatOpen = useChat((state) => state.setOpen)

  const loadCommandMenu = useCallback(() => {
    commandLoadPromise.current ??= import('@/shared/components/ui/command-menu/command-menu').then(
      ({ CommandMenu: LoadedCommandMenu }) => setCommandMenu(() => LoadedCommandMenu),
    )
  }, [])

  const loadChat = useCallback(() => {
    chatLoadPromise.current ??= import('@/shared/components/ui/chat-widget/chat-widget').then(
      ({ ChatWidget: LoadedChatWidget }) => setChatWidget(() => LoadedChatWidget),
    )
  }, [])

  useEffect(() => {
    if (isCommandMenuOpen) loadCommandMenu()
  }, [isCommandMenuOpen, loadCommandMenu])

  useEffect(() => {
    const handleCommandShortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k' || (!event.metaKey && !event.ctrlKey)) return

      event.preventDefault()
      loadCommandMenu()
      setCommandMenuOpen(true)
    }

    document.addEventListener('keydown', handleCommandShortcut)
    return () => document.removeEventListener('keydown', handleCommandShortcut)
  }, [loadCommandMenu, setCommandMenuOpen])

  const openChat = () => {
    loadChat()
    setChatOpen(true)
  }

  return (
    <>
      <ProgressiveGsapAnimations />
      {CommandMenu ? <CommandMenu /> : null}
      {ChatWidget ? (
        <ChatWidget />
      ) : (
        <button
          type="button"
          data-chat-launcher
          onClick={openChat}
          aria-label={t('fabTooltip')}
          className="fixed right-[max(1.5rem,var(--safe-right))] bottom-[max(1.5rem,var(--safe-bottom))] z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-emerald-500/25 transition-transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95"
        >
          {/* biome-ignore lint/performance/noImgElement: tiny pre-widget launcher keeps the chat bundle lazy. */}
          <img
            src="/images/avatar-112.webp"
            alt="Rani"
            width={56}
            height={56}
            decoding="async"
            className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-500"
          />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
          </span>
        </button>
      )}
    </>
  )
}
