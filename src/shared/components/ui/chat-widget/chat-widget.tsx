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
  <div className="flex items-center gap-1 px-4 py-3">
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
          className="underline underline-offset-2 decoration-emerald-500/50 transition-colors hover:text-emerald-400 dark:hover:text-emerald-300"
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
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-emerald-600 text-white dark:bg-emerald-500'
            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
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
                'fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900',
                'inset-4 sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[540px] sm:w-[400px]',
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-linear-to-r from-emerald-600 to-emerald-700 px-4 py-3 dark:border-slate-800 dark:from-emerald-700 dark:to-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0">
                    <Image
                      src="/images/rani-avatar.webp"
                      alt="Rani"
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white/30"
                    />
                    <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-emerald-700 bg-green-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">{t('title')}</h2>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-emerald-100">{t('status')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={clearMessages}
                      aria-label={t('clear')}
                      className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Restart className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label={t('close')}
                    className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <CloseCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30">
                      <MinimalisticMagnifier className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t('welcome')}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {t('welcomeSubtitle')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {suggestions.map((suggestion) => (
                        <button
                          type="button"
                          key={suggestion}
                          onClick={() => handleSuggestion(suggestion)}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-left text-xs text-slate-600 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
                        >
                          {suggestion}
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
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {t('error')}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
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
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    aria-label={t('send')}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition-all hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-600"
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
