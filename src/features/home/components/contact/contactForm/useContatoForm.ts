'use client'

import { useTranslations } from 'next-intl'
import type { ChangeEvent, FormEvent } from 'react'
import { useCallback, useState } from 'react'
import type { ContactFormInput } from '@/shared/lib/contact-form'
import { createMailtoFallback, sendContactEmail } from '@/shared/services/formly-email-service'

type ContactField = keyof ContactFormInput
type ContactElement = HTMLInputElement | HTMLTextAreaElement
type ContactFormErrors = Partial<Record<ContactField, { type: string }>>
type ContactSubmitHandler = (data: ContactFormInput) => Promise<void> | void

type RegisteredField = {
  name: ContactField
  value: string
  onChange: (event: ChangeEvent<ContactElement>) => void
}

interface UseContactFormReturn {
  t: ReturnType<typeof useTranslations>
  register: (name: ContactField) => RegisteredField
  handleSubmit: (handler: ContactSubmitHandler) => (event?: FormEvent<HTMLFormElement>) => Promise<void>
  errors: ContactFormErrors
  isSubmitting: boolean
  submitStatus: 'idle' | 'success' | 'error'
  onSubmit: ContactSubmitHandler
}

const initialValues: Required<ContactFormInput> = {
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
}

function normalize(values: Required<ContactFormInput>): ContactFormInput {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    subject: values.subject.trim(),
    message: values.message.trim(),
    website: values.website.trim(),
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validate(data: ContactFormInput): ContactFormErrors {
  const errors: ContactFormErrors = {}

  if (data.name.length < 2 || data.name.length > 120) errors.name = { type: 'name' }
  if (!isValidEmail(data.email) || data.email.length > 200) errors.email = { type: 'email' }
  if (data.subject.length < 5 || data.subject.length > 200) errors.subject = { type: 'subject' }
  if (data.message.length < 10 || data.message.length > 5000) errors.message = { type: 'message' }
  if ((data.website ?? '').length > 0) errors.website = { type: 'website' }

  return errors
}

export function useContactForm(): UseContactFormReturn {
  const t = useTranslations('contact.form')
  const [values, setValues] = useState<Required<ContactFormInput>>(initialValues)
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const register = useCallback(
    (name: ContactField): RegisteredField => ({
      name,
      value: values[name] ?? '',
      onChange: (event) => {
        const value = event.currentTarget.value
        setValues((current) => ({ ...current, [name]: value }))
        setErrors((current) => {
          if (!current[name]) return current
          const next = { ...current }
          delete next[name]
          return next
        })
        setSubmitStatus('idle')
      },
    }),
    [values],
  )

  const handleSubmit = useCallback(
    (handler: ContactSubmitHandler) => async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault()
      const data = normalize(values)
      const validationErrors = validate(data)

      setErrors(validationErrors)
      if (Object.keys(validationErrors).length > 0) return

      await handler(data)
    },
    [values],
  )

  const onSubmit: ContactSubmitHandler = async (data) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      await sendContactEmail(data)

      setSubmitStatus('success')
      setValues(initialValues)
    } catch (error) {
      console.error('Erro ao enviar formulário via Formly:', error)
      setSubmitStatus('error')

      const mailtoLink = createMailtoFallback(data)

      setTimeout(() => {
        window.open(mailtoLink)
      }, 1500)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    t,
    register,
    handleSubmit,
    errors,
    isSubmitting,
    submitStatus,
    onSubmit,
  }
}
