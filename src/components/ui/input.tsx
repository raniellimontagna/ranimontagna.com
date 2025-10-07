'use client'

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

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
  'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-400'

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
