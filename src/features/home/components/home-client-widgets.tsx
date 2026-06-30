'use client'

import { useTranslations } from 'next-intl'
import { type ComponentType, useCallback, useEffect, useRef, useState } from 'react'
import { ProgressiveGsapAnimations } from '@/shared/components/animations/progressive-gsap-animations'
import { useChat } from '@/shared/store/use-chat/use-chat'
import { useCommandMenu } from '@/shared/store/use-command-menu/use-command-menu'

type ClientWidgets = {
  CommandMenu: ComponentType
  ChatWidget: ComponentType
}

export function HomeClientWidgets() {
  const [widgets, setWidgets] = useState<ClientWidgets | null>(null)
  const loadPromiseRef = useRef<Promise<void> | null>(null)
  const t = useTranslations('chat')
  const isCommandMenuOpen = useCommandMenu((state) => state.isOpen)
  const setCommandMenuOpen = useCommandMenu((state) => state.setOpen)
  const setChatOpen = useChat((state) => state.setOpen)

  const loadWidgets = useCallback(() => {
    if (loadPromiseRef.current) return

    loadPromiseRef.current = Promise.all([
      import('@/shared/components/ui/command-menu/command-menu'),
      import('@/shared/components/ui/chat-widget/chat-widget'),
    ]).then(([commandMenu, chatWidget]) => {
      setWidgets({
        CommandMenu: commandMenu.CommandMenu,
        ChatWidget: chatWidget.ChatWidget,
      })
    })
  }, [])

  useEffect(() => {
    if (isCommandMenuOpen) {
      loadWidgets()
    }
  }, [isCommandMenuOpen, loadWidgets])

  useEffect(() => {
    const handleCommandShortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k' || (!event.metaKey && !event.ctrlKey)) {
        return
      }

      event.preventDefault()
      loadWidgets()
      setCommandMenuOpen(true)
    }

    document.addEventListener('keydown', handleCommandShortcut)
    return () => document.removeEventListener('keydown', handleCommandShortcut)
  }, [loadWidgets, setCommandMenuOpen])

  const openChat = () => {
    loadWidgets()
    setChatOpen(true)
  }

  if (!widgets) {
    return (
      <>
        <ProgressiveGsapAnimations />
        <button
          type="button"
          onClick={openChat}
          aria-label={t('fabTooltip')}
          className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-emerald-500/25 transition-transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95"
        >
          {/* biome-ignore lint/performance/noImgElement: tiny pre-widget launcher keeps the chat bundle lazy. */}
          <img
            src="/images/avatar.webp"
            alt="Rani"
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-500"
          />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
          </span>
        </button>
      </>
    )
  }

  const { CommandMenu, ChatWidget } = widgets

  return (
    <>
      <ProgressiveGsapAnimations />
      <CommandMenu />
      <ChatWidget />
    </>
  )
}
