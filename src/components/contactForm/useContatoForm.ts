'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'

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
      // TODO: Replace this with actual email sending logic if needed
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mailtoLink = `mailto:raniellimontagna@gmail.com?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(`Nome: ${data.name}\nEmail: ${data.email}\n\nMensagem:\n${data.message}`)}`
      window.open(mailtoLink)

      setSubmitStatus('success')
      reset()
    } catch {
      setSubmitStatus('error')
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
