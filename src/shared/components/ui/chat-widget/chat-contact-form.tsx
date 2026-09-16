'use client'

import { CheckCircle, SendSquare } from '@solar-icons/react/ssr'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { contactFormSchema } from '@/shared/lib/contact-form'
import { sendContactEmail } from '@/shared/services/formly-email-service'

type ChatContactFormProps = {
  /** Rascunho vindo da conversa (última pergunta do visitante). */
  draft?: string
  onCancel: () => void
}

type FormState = 'idle' | 'sending' | 'sent' | 'error'

/**
 * Recado direto de dentro do chat. Reaproveita /api/contact — mesma validação,
 * honeypot e rate limit do formulário da página, sem expor chave no cliente.
 */
export function ChatContactForm({
  draft = '',
  onCancel,
}: ChatContactFormProps): React.ReactElement {
  const t = useTranslations('chat.directMessage')
  const fieldId = useId()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(draft)
  const [website, setWebsite] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [invalid, setInvalid] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (state === 'sending') return

    const payload = {
      name,
      email,
      subject: t('subject', { name: name.trim() || '—' }),
      message,
      website,
    }

    const parsed = contactFormSchema.safeParse(payload)
    if (!parsed.success) {
      setInvalid(true)
      return
    }

    setInvalid(false)
    setState('sending')

    try {
      await sendContactEmail(parsed.data)
      setState('sent')
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div
        role="status"
        data-testid="chat-contact-success"
        className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-5 text-center"
      >
        <CheckCircle className="h-8 w-8 text-emerald-500" />
        <div>
          <p className="text-sm font-semibold text-foreground">{t('successTitle')}</p>
          <p className="mt-1 text-sm leading-6 text-muted">{t('success')}</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-full border border-line bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:border-foreground/30"
        >
          {t('backToChat')}
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      data-testid="chat-contact-form"
      className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{t('title')}</p>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-semibold text-muted transition-colors hover:text-foreground"
        >
          {t('cancel')}
        </button>
      </div>
      <p className="text-xs leading-5 text-muted">{t('subtitle')}</p>

      <div className="mt-1 hidden" aria-hidden="true">
        <label htmlFor={`${fieldId}-website`}>Website</label>
        <input
          id={`${fieldId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <label className="sr-only" htmlFor={`${fieldId}-name`}>
        {t('name')}
      </label>
      <input
        id={`${fieldId}-name`}
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t('name')}
        autoComplete="name"
        maxLength={120}
        className="min-h-11 rounded-xl border border-line bg-background px-3 text-sm text-foreground placeholder:text-muted focus:border-foreground/30 focus:outline-none"
      />

      <label className="sr-only" htmlFor={`${fieldId}-email`}>
        {t('email')}
      </label>
      <input
        id={`${fieldId}-email`}
        type="email"
        inputMode="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={t('email')}
        autoComplete="email"
        maxLength={200}
        className="min-h-11 rounded-xl border border-line bg-background px-3 text-sm text-foreground placeholder:text-muted focus:border-foreground/30 focus:outline-none"
      />

      <label className="sr-only" htmlFor={`${fieldId}-message`}>
        {t('message')}
      </label>
      <textarea
        id={`${fieldId}-message`}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={t('message')}
        rows={3}
        maxLength={5000}
        className="resize-none rounded-xl border border-line bg-background px-3 py-2 text-sm leading-6 text-foreground placeholder:text-muted focus:border-foreground/30 focus:outline-none"
      />

      {invalid && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-300">
          {t('invalid')}
        </p>
      )}
      {state === 'error' && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-300">
          {t('error')}
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <SendSquare className="h-4 w-4" />
        {state === 'sending' ? t('sending') : t('send')}
      </button>
      <p className="text-center text-[11px] leading-5 text-muted">{t('privacy')}</p>
    </form>
  )
}
