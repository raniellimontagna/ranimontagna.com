'use client'

import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react'

interface BaseInputProps {
  label: string
  error?: string
  className?: string
}

interface InputProps
  extends BaseInputProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {}

interface TextareaProps
  extends BaseInputProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {}

const inputStyles =
  'mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-400/10'

const labelStyles = 'block text-sm font-medium text-slate-700 dark:text-slate-300'

const errorStyles = 'mt-2 text-xs text-red-600 dark:text-red-400'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className={className}>
        <label htmlFor={inputId} className={labelStyles}>
          {label}
        </label>
        <input ref={ref} id={inputId} className={cn(inputStyles)} {...props} />
        {error && <p className={errorStyles}>{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id || props.name

    return (
      <div className={className}>
        <label htmlFor={textareaId} className={labelStyles}>
          {label}
        </label>
        <textarea ref={ref} id={textareaId} className={cn(inputStyles, 'resize-none')} {...props} />
        {error && <p className={errorStyles}>{error}</p>}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
