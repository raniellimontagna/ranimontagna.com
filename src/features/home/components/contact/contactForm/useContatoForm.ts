'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type {
  FieldErrors,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormRegister,
} from 'react-hook-form'
import { useForm } from 'react-hook-form'
import {
  type ContactFormData,
  type ContactFormInput,
  contactFormSchema,
} from '@/shared/lib/contact-form'
import { createMailtoFallback, sendContactEmail } from '@/shared/services/formly-email-service'

interface UseContactFormReturn {
  t: ReturnType<typeof useTranslations>
  register: UseFormRegister<ContactFormInput>
  handleSubmit: UseFormHandleSubmit<ContactFormInput, ContactFormData>
  errors: FieldErrors<ContactFormInput>
  isSubmitting: boolean
  submitStatus: 'idle' | 'success' | 'error'
  onSubmit: SubmitHandler<ContactFormData>
}

export function useContactForm(): UseContactFormReturn {
  const t = useTranslations('contact.form')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormInput, undefined, ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      website: '',
    },
  })

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      await sendContactEmail(data)

      setSubmitStatus('success')
      reset()
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
