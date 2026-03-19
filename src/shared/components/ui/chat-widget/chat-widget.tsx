'use client'

import { CloseCircle, MinimalisticMagnifier, Restart, SendSquare } from '@solar-icons/react/ssr'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { useChat } from '@/shared/store/use-chat/use-chat'
import type { ChatMessage } from '@/shared/store/use-chat/use-chat.types'

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

const renderMarkdown = (content: string): React.ReactNode[] => {
  const parts = content.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 decoration-accent-ice/50 transition-colors hover:text-accent-ice"
        >
          {linkMatch[1]}
        </a>
      )
    }

    return part
  })
}

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
        <p className="wrap-break-word whitespace-pre-wrap">{renderMarkdown(message.content)}</p>
      </div>
    </motion.div>
  )
}

export const ChatWidget = (): React.ReactElement => {
  const t = useTranslations('chat')
  const locale = useLocale()
  const { isOpen, setOpen, toggle, messages, isLoading, error, sendMessage, clearMessages } =
    useChat()

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback((): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (isOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        setOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, setOpen])

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
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggle}
            aria-label={t('fabTooltip')}
            className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-emerald-500/25 transition-shadow hover:shadow-xl hover:shadow-emerald-500/30"
          >
            <Image
              src="/images/rani-avatar.webp"
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
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm sm:hidden"
              onClick={() => setOpen(false)}
            />

            <motion.div
              ref={containerRef}
              role="dialog"
              aria-label={t('title')}
              aria-modal="true"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'fixed z-50 flex min-h-0 flex-col overflow-hidden rounded-4xl border border-line bg-background shadow-2xl',
                'inset-4 max-h-[calc(100dvh-2rem)] sm:inset-auto sm:right-6 sm:bottom-6 sm:h-auto sm:w-100 sm:max-h-[calc(100dvh-3rem)]',
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-line bg-surface-strong px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0">
                    <Image
                      src="/images/rani-avatar.webp"
                      alt="Rani"
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-line"
                    />
                    <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">{t('title')}</h2>
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
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label={t('close')}
                    className="rounded-xl border border-transparent p-2 text-muted transition-colors hover:border-line hover:bg-background hover:text-foreground"
                  >
                    <CloseCircle className="h-5 w-5" />
                  </button>
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
                        <p className="mt-2 text-sm leading-7 text-muted">{t('welcomeSubtitle')}</p>
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
                  <>
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    {isLoading && messages[messages.length - 1]?.content === '' && (
                      <TypingIndicator />
                    )}
                  </>
                )}

                {error && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-3 py-2 text-xs text-red-600 dark:text-red-300">
                    {t('error')}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-line bg-surface p-3">
                <div className="flex items-center gap-2 rounded-2xl border border-line bg-background p-2 transition-all hover:border-foreground/20 hover:bg-surface-strong focus-within:border-accent-ice/50 focus-within:bg-surface-strong focus-within:outline-2 focus-within:outline-accent-ice/35 focus-within:outline-offset-0">
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
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus-visible:outline-none disabled:opacity-50"
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
          </>
        )}
      </AnimatePresence>
    </>
  )
}
