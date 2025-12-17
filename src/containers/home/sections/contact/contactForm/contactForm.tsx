'use client'

import { AlertCircle, CheckCircle, Send } from 'lucide-react'
import { Button, Input, Textarea } from '@/components/ui'
import { useContactForm } from './useContatoForm'

export function ContactForm() {
  const { t, register, handleSubmit, errors, isSubmitting, submitStatus, onSubmit } =
    useContactForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="contact-form">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label={t('name.label')}
          placeholder={t('name.placeholder')}
          error={errors.name ? t('validation.name') : undefined}
          {...register('name')}
        />

        <Input
          type="email"
          label={t('email.label')}
          placeholder={t('email.placeholder')}
          error={errors.email ? t('validation.email') : undefined}
          {...register('email')}
        />
      </div>

      <Input
        label={t('subject.label')}
        placeholder={t('subject.placeholder')}
        error={errors.subject ? t('validation.subject') : undefined}
        {...register('subject')}
      />

      <Textarea
        label={t('message.label')}
        placeholder={t('message.placeholder')}
        rows={5}
        error={errors.message ? t('validation.message') : undefined}
        {...register('message')}
      />

      <div>
        <Button
          type="submit"
          loading={isSubmitting}
          icon={<Send className="h-5 w-5" />}
          className="w-full border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-blue-700 hover:to-purple-700 hover:shadow-xl focus:ring-purple-500 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600"
        >
          {isSubmitting ? t('sending') : t('send')}
        </Button>
      </div>

      {submitStatus === 'success' && (
        <div className="flex items-center rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle className="mr-3 h-5 w-5" />
          <span className="text-sm">{t('success')}</span>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="flex items-center rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="mr-3 h-5 w-5" />
          <span className="text-sm">{t('error')}</span>
        </div>
      )}
    </form>
  )
}
