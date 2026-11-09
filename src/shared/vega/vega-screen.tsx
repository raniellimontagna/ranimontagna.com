'use client'

import { useLocale, useTranslations } from 'next-intl'
import { type KeyboardEvent, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  prefersReducedMotion,
  startSmoothScroll,
  stopSmoothScroll,
} from '@/shared/components/motion'
import { RATE_LIMIT_ERROR, useChat } from '@/shared/store/use-chat/use-chat'
import { VegaComposer } from './vega-composer'
import { VegaMark } from './vega-mark'
import { VegaMessage } from './vega-message'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])'

/** The big mark grows out of the launcher into the center of the screen. */
function growFromLauncher(target: HTMLElement | null) {
  if (!target || prefersReducedMotion() || typeof target.animate !== 'function') return
  const launcher = document.querySelector<HTMLElement>('[data-chat-launcher]')
  const from = launcher?.getBoundingClientRect()
  const to = target.getBoundingClientRect()
  if (!from || !to.width) return
  const dx = from.left + from.width / 2 - (to.left + to.width / 2)
  const dy = from.top + from.height / 2 - (to.top + to.height / 2)
  const scale = from.width / to.width
  target.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.4 },
      { transform: 'none', opacity: 1 },
    ],
    { duration: 520, easing: 'cubic-bezier(.2,.7,.2,1)' },
  )
}

/**
 * Vega in full screen: a centered question box like the big assistants, answers
 * in place with cards that lead into the site, and "back to the site" always at
 * hand. It is a modal dialog: focus stays inside and the page behind stops.
 */
export function VegaScreen() {
  const t = useTranslations('vega')
  const locale = useLocale()
  const isOpen = useChat((state) => state.isOpen)
  const messages = useChat((state) => state.messages)
  const isLoading = useChat((state) => state.isLoading)
  const error = useChat((state) => state.error)
  const typingId = useChat((state) => state.typingId)
  const failedQuestion = useChat((state) => state.failedQuestion)
  const setOpen = useChat((state) => state.setOpen)
  const sendMessage = useChat((state) => state.sendMessage)
  const retry = useChat((state) => state.retry)
  const finishTyping = useChat((state) => state.finishTyping)
  const clearMessages = useChat((state) => state.clearMessages)

  const dialogRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  const conversation = messages.length > 0
  const suggestions = t.raw('suggestions') as string[]

  const close = useCallback(() => setOpen(false), [setOpen])

  useLayoutEffect(() => {
    if (!isOpen) return
    // Focus goes back to whatever opened Vega (launcher, hero button, 404 link);
    // with nothing focused (⌘K on the page) it lands on the launcher.
    const active = document.activeElement as HTMLElement | null
    returnFocus.current =
      active && active !== document.body
        ? active
        : document.querySelector<HTMLElement>('[data-chat-launcher]')
    document.documentElement.style.overflow = 'hidden'
    stopSmoothScroll()

    // Everything behind the dialog leaves the tab order and the accessibility tree.
    const dialog = dialogRef.current
    const inerted: HTMLElement[] = []
    for (const child of Array.from(document.body.children)) {
      if (child === dialog || !(child instanceof HTMLElement) || child.hasAttribute('inert')) {
        continue
      }
      child.setAttribute('inert', '')
      inerted.push(child)
    }

    inputRef.current?.focus()
    growFromLauncher(heroRef.current)

    return () => {
      for (const element of inerted) element.removeAttribute('inert')
      document.documentElement.style.overflow = ''
      startSmoothScroll()
      returnFocus.current?.focus()
    }
  }, [isOpen])

  // Esc closes from anywhere, before other overlays' listeners see it.
  useEffect(() => {
    if (!isOpen) return
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
    }
    document.addEventListener('keydown', onEscape, true)
    return () => document.removeEventListener('keydown', onEscape, true)
  }, [isOpen, setOpen])

  // Follow the conversation as it grows.
  useEffect(() => {
    const area = scrollRef.current
    if (area && messages.length) area.scrollTop = area.scrollHeight
  }, [messages])

  const ask = (question: string) => {
    void sendMessage(question, locale)
    inputRef.current?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) return
    const items = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    const first = items[0]
    const last = items.at(-1)
    if (!first || !last) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  if (!isOpen) return null

  const lastMessage = messages.at(-1)
  const thinking =
    isLoading && (!lastMessage || lastMessage.role === 'user' || !lastMessage.content)

  const canRetry = Boolean(error || failedQuestion) && !isLoading
  const errorBlock = canRetry ? (
    <div className="flex flex-wrap items-center gap-3 text-sm text-foreground" role="alert">
      {error ? <span>{t(error === RATE_LIMIT_ERROR ? 'errorRateLimit' : 'error')}</span> : null}
      <button
        type="button"
        onClick={() => {
          void retry(locale)
          inputRef.current?.focus()
        }}
        className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-xs font-semibold hover:border-accent hover:text-accent"
      >
        {t('retry')}
      </button>
    </div>
  ) : null

  const composer = (className: string) => (
    <VegaComposer
      inputRef={inputRef}
      placeholder={t('placeholder')}
      sendLabel={t('send')}
      disabled={isLoading}
      onSend={ask}
      className={className}
    />
  )

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('label')}
      data-state={conversation ? 'conversation' : 'empty'}
      data-lenis-prevent
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-[70] flex h-dvh flex-col bg-background text-foreground"
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-8">
        {conversation ? (
          <span data-vega-corner className="flex items-center gap-2 text-sm font-semibold">
            <VegaMark size={32} density={90} thinking={thinking} />
            {t('label')}
          </span>
        ) : (
          <span className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
            {t('label')}
          </span>
        )}
        <div className="flex items-center gap-2">
          {conversation ? (
            <button
              type="button"
              onClick={clearMessages}
              className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-xs font-semibold hover:border-foreground"
            >
              {t('newChat')}
            </button>
          ) : null}
          <button
            type="button"
            onClick={close}
            className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-xs font-semibold hover:border-foreground"
          >
            <span aria-hidden="true">← </span>
            {t('back')}
          </button>
        </div>
      </div>

      {conversation ? (
        <>
          <div ref={scrollRef} aria-live="polite" className="flex-1 overflow-y-auto px-4 sm:px-8">
            <div className="mx-auto flex w-full max-w-[680px] flex-col gap-5 py-8">
              {messages.map((message) =>
                message.role === 'assistant' && !message.content ? null : (
                  <VegaMessage
                    key={message.id}
                    message={message}
                    typing={message.id === typingId}
                    cardCta={t('cardCta')}
                    onTyped={finishTyping}
                    onOpenCard={close}
                  />
                ),
              )}
              {thinking ? (
                <p className="flex items-center gap-1.5 font-mono text-xs text-accent">
                  <span aria-hidden="true">◆</span>
                  <span>{t('thinking')}</span>
                </p>
              ) : null}
              {errorBlock}
            </div>
          </div>
          <div data-vega-composer className="sticky bottom-0 bg-background px-4 pt-2 pb-4 sm:px-8">
            {composer('mx-auto w-full max-w-[680px]')}
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-4 pb-10">
          <div ref={heroRef} data-vega-hero>
            <VegaMark size={120} density={200} thinking={thinking} className="sm:hidden" />
            <VegaMark size={170} thinking={thinking} className="hidden sm:block" />
          </div>
          <h2 className="text-center text-2xl font-medium tracking-tight sm:text-3xl">
            {t('greeting')} <span className="text-muted">{t('greetingAsk')}</span>
          </h2>
          {thinking ? (
            <p className="flex items-center gap-1.5 font-mono text-xs text-accent">
              <span aria-hidden="true">◆</span>
              <span>{t('thinking')}</span>
            </p>
          ) : null}
          {composer('w-full max-w-[560px]')}
          <ul className="flex w-full max-w-[560px] gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">
            {suggestions.map((suggestion) => (
              <li key={suggestion} className="shrink-0">
                <button
                  type="button"
                  onClick={() => ask(suggestion)}
                  className="press inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-xs text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
          {errorBlock}
        </div>
      )}
    </div>,
    document.body,
  )
}
