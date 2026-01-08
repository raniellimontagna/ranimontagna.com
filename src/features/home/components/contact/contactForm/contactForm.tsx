'use client'

import { ArrowRight, CheckCircle, DangerCircle, Restart } from '@solar-icons/react/ssr'
import { Input, Textarea } from '@/shared/components/ui'
import { useContactForm } from './useContatoForm'

export function ContactForm() {
  const { t, register, handleSubmit, errors, isSubmitting, submitStatus, onSubmit } =
    useContactForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="contact-form">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
        rows={4}
        error={errors.message ? t('validation.message') : undefined}
        {...register('message')}
      />

      {/* Submit Button - Professional Design */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative w-full overflow-hidden rounded-xl bg-slate-900 px-6 py-4 font-semibold text-white transition-all duration-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:focus:ring-white"
      >
        {/* Hover effect */}
        <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full dark:via-slate-900/10" />

        <span className="relative flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <Restart className="h-5 w-5 animate-spin" />
              <span>{t('sending')}</span>
            </>
          ) : (
            <>
              <span>{t('send')}</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </span>
      </button>

      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-900/20">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-medium text-emerald-800 dark:text-emerald-300">
              {t('successTitle') || 'Mensagem enviada!'}
            </p>
            <p className="mt-0.5 text-sm text-emerald-700 dark:text-emerald-400">{t('success')}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitStatus === 'error' && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <DangerCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-medium text-red-800 dark:text-red-300">
              {t('errorTitle') || 'Erro no envio'}
            </p>
            <p className="mt-0.5 text-sm text-red-700 dark:text-red-400">{t('error')}</p>
          </div>
        </div>
      )}
    </form>
  )
}
