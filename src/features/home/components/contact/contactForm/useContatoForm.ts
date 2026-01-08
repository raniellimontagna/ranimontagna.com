'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { formlyEmailService } from '@/shared/services/formly-email-service'

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  subject: z.string().min(5),
  message: z.string().min(10),
})

type ContactFormData = z.infer<typeof contactSchema>

export function useContactForm() {
  const t = useTranslations('contact.form')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      await formlyEmailService.sendContactEmail(data)

      setSubmitStatus('success')
      reset()
    } catch (error) {
      console.error('Erro ao enviar formulário via Formly:', error)
      setSubmitStatus('error')

      const mailtoLink = formlyEmailService.createMailtoFallback(data)

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
