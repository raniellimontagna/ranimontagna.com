'use client'

import dynamic from 'next/dynamic'

const CommandMenu = dynamic(
  () => import('@/shared/components/ui/command-menu/command-menu').then((mod) => mod.CommandMenu),
  { ssr: false },
)

const ChatWidget = dynamic(
  () => import('@/shared/components/ui/chat-widget/chat-widget').then((mod) => mod.ChatWidget),
  { ssr: false },
)

export function HomeClientWidgets() {
  return (
    <>
      <CommandMenu />
      <ChatWidget />
    </>
  )
}
