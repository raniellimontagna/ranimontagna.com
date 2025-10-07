'use client'

import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useContactForm } from './useContatoForm'

export function ContactForm() {
  const { t, register, handleSubmit, errors, isSubmitting, submitStatus, onSubmit } =
    useContactForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="contact-form">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {t('name.label')}
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-400"
            placeholder={t('name.placeholder')}
          />
          {errors.name && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{t('validation.name')}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {t('email.label')}
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-400"
            placeholder={t('email.placeholder')}
          />
          {errors.email && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{t('validation.email')}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {t('subject.label')}
        </label>
        <input
          type="text"
          id="subject"
          {...register('subject')}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-400"
          placeholder={t('subject.placeholder')}
        />
        {errors.subject && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{t('validation.subject')}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {t('message.label')}
        </label>
        <textarea
          id="message"
          rows={5}
          {...register('message')}
          className="mt-1 block w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-400"
          placeholder={t('message.placeholder')}
        />
        {errors.message && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{t('validation.message')}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-700 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t('sending')}
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              {t('send')}
            </>
          )}
        </button>
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
