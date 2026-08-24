'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { CloseCircle, MinimalisticMagnifier, Restart, SendSquare } from '@solar-icons/react/ssr'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { useChat } from '@/shared/store/use-chat/use-chat'
import type { ChatMessage } from '@/shared/store/use-chat/use-chat.types'
import { renderChatMarkdown } from './chat-markdown'

const TypingIndicator = (): React.ReactElement => (
  <div className="inline-flex items-center gap-1 rounded-2xl border border-line bg-surface px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
      />
    ))}
  </div>
)

const MessageBubble = ({ message }: { message: ChatMessage }): React.ReactElement => {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-foreground text-background'
            : 'border border-line bg-surface text-foreground',
        )}
      >
        <p className="wrap-break-word whitespace-pre-wrap">{renderChatMarkdown(message.content)}</p>
      </div>
    </motion.div>
  )
}

export const ChatWidget = (): React.ReactElement => {
  const t = useTranslations('chat')
  const locale = useLocale()
  const { isOpen, setOpen, messages, isLoading, error, sendMessage, clearMessages } = useChat()

  const [input, setInput] = useState('')
  const [completionAnnouncement, setCompletionAnnouncement] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const wasLoadingRef = useRef(isLoading)
  const lastMessage = messages.at(-1)

  const scrollToBottom = useCallback((): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const setMessagesEnd = useCallback(
    (node: HTMLDivElement | null): void => {
      messagesEndRef.current = node
      if (node) scrollToBottom()
    },
    [scrollToBottom],
  )

  useEffect(() => {
    if (isOpen && (messages.length > 0 || isLoading)) scrollToBottom()
  }, [isLoading, isOpen, messages.length, scrollToBottom])

  useEffect(() => {
    const wasLoading = wasLoadingRef.current
    wasLoadingRef.current = isLoading

    if (isLoading || !lastMessage) {
      setCompletionAnnouncement(null)
      return
    }

    if (wasLoading && lastMessage.role === 'assistant' && lastMessage.content) {
      setCompletionAnnouncement(lastMessage.content)
    }
  }, [isLoading, lastMessage])

  const handleSend = async (): Promise<void> => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    setInput('')
    await sendMessage(trimmed, locale)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestions = [
    t('suggestions.skills'),
    t('suggestions.experience'),
    t('suggestions.projects'),
  ]

  const handleSuggestion = (suggestion: string): void => {
    sendMessage(suggestion, locale)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      {/* FAB Button */}
      <AnimatePresence>
        {!isOpen && (
          <Dialog.Trigger asChild>
            <motion.button
              type="button"
              data-chat-launcher
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={t('fabTooltip')}
              className="fixed right-[max(1.5rem,var(--safe-right))] bottom-[max(1.5rem,var(--safe-bottom))] z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-emerald-500/25 transition-shadow hover:shadow-xl hover:shadow-emerald-500/30"
            >
              <Image
                src="/images/avatar-112.webp"
                alt="Rani"
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-500"
              />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
              </span>
            </motion.button>
          </Dialog.Trigger>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                data-testid="chat-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none"
                onClick={() => setOpen(false)}
              />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              onOpenAutoFocus={(event) => {
                event.preventDefault()
                inputRef.current?.focus()
              }}
              onCloseAutoFocus={(event) => {
                event.preventDefault()
                requestAnimationFrame(() => {
                  document.querySelector<HTMLButtonElement>('[data-chat-launcher]')?.focus()
                })
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={cn(
                  'fixed z-50 flex min-h-0 flex-col overflow-hidden rounded-4xl border border-line bg-background shadow-2xl',
                  'top-[max(1rem,var(--safe-top))] right-[max(1rem,var(--safe-right))] bottom-[max(1rem,var(--safe-bottom))] left-[max(1rem,var(--safe-left))] max-h-[calc(100dvh-2rem)] sm:top-auto sm:left-auto sm:h-auto sm:w-100 sm:max-h-[calc(100dvh-3rem)] sm:right-[max(1.5rem,var(--safe-right))] sm:bottom-[max(1.5rem,var(--safe-bottom))]',
                )}
              >
                <Dialog.Description className="sr-only">
                  {t('dialogDescription')}
                </Dialog.Description>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line bg-surface-strong px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0">
                      <Image
                        src="/images/avatar-112.webp"
                        alt="Rani"
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-line"
                      />
                      <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
                    </div>
                    <div>
                      <Dialog.Title className="text-sm font-semibold text-foreground">
                        {t('title')}
                      </Dialog.Title>
                      <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-line bg-background px-2 py-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                          {t('status')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {messages.length > 0 && (
                      <button
                        type="button"
                        onClick={clearMessages}
                        aria-label={t('clear')}
                        className="rounded-xl border border-transparent p-2 text-muted transition-colors hover:border-line hover:bg-background hover:text-foreground"
                      >
                        <Restart className="h-4 w-4" />
                      </button>
                    )}
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        aria-label={t('close')}
                        className="rounded-xl border border-transparent p-2 text-muted transition-colors hover:border-line hover:bg-background hover:text-foreground"
                      >
                        <CloseCircle className="h-5 w-5" />
                      </button>
                    </Dialog.Close>
                  </div>
                </div>

                {/* Messages */}
                <div className="min-h-0 flex-1 flex flex-col gap-3 overflow-y-auto overscroll-contain bg-background p-4 scrollbar-thin">
                  {messages.length === 0 ? (
                    <div className="flex min-h-full flex-col items-center justify-center gap-4 text-center">
                      <div className="surface-panel w-full rounded-4xl p-6">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-line bg-background">
                          <MinimalisticMagnifier className="h-8 w-8 text-foreground" />
                        </div>
                        <div className="mt-5">
                          <p className="text-sm font-medium text-foreground">{t('welcome')}</p>
                          <p className="mt-2 text-sm leading-7 text-muted">
                            {t('welcomeSubtitle')}
                          </p>
                          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                            {t('betaNotice')}
                          </p>
                        </div>
                      </div>
                      <div className="flex w-full flex-col gap-2">
                        {suggestions.map((suggestion) => (
                          <button
                            type="button"
                            key={suggestion}
                            onClick={() => handleSuggestion(suggestion)}
                            className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3 text-left text-sm text-foreground transition-all hover:border-foreground/20 hover:bg-surface-strong"
                          >
                            <span>{suggestion}</span>
                            <SendSquare className="h-4 w-4 text-muted" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      role="log"
                      aria-label={t('messagesLabel')}
                      aria-busy={isLoading}
                      aria-relevant="additions"
                      className="flex flex-col gap-3"
                    >
                      {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                      {isLoading && messages[messages.length - 1]?.content === '' && (
                        <TypingIndicator />
                      )}
                    </div>
                  )}

                  {error && (
                    <div
                      role="alert"
                      aria-atomic="true"
                      className="rounded-2xl border border-red-500/20 bg-red-500/8 px-3 py-2 text-xs text-red-600 dark:text-red-300"
                    >
                      {t('error')}
                    </div>
                  )}

                  {completionAnnouncement ? (
                    <div role="status" aria-atomic="true" className="sr-only">
                      {completionAnnouncement}
                    </div>
                  ) : null}

                  <div ref={setMessagesEnd} />
                </div>

                {/* Input */}
                <div className="border-t border-line bg-surface p-3">
                  <div className="interactive-field-shell flex items-center gap-2 rounded-2xl bg-background p-2 hover:bg-surface-strong focus-within:bg-surface-strong">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t('placeholder')}
                      disabled={isLoading}
                      maxLength={500}
                      aria-label={t('placeholder')}
                      className="interactive-field-input flex-1 px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-0 focus-visible:outline-none disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      aria-label={t('send')}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-all hover:opacity-90 focus-visible:outline-none disabled:opacity-40 disabled:hover:opacity-40"
                    >
                      <SendSquare className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
