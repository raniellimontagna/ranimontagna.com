'use client'

import { AlertCircle } from 'lucide-react'
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, useState } from 'react'
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

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const inputId = id || props.name

    return (
      <div className={cn('group', className)}>
        {/* Label */}
        <label
          htmlFor={inputId}
          className={cn(
            'mb-2 flex items-center gap-2 text-sm font-medium transition-colors duration-200',
            error
              ? 'text-red-600 dark:text-red-400'
              : isFocused
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400',
          )}
        >
          <span
            className={cn(
              'font-mono text-xs transition-colors',
              error
                ? 'text-red-400 dark:text-red-500'
                : isFocused
                  ? 'text-emerald-500'
                  : 'text-slate-300 dark:text-slate-600',
            )}
          >
            $
          </span>
          {label}
        </label>

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          className={cn(
            'block w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200',
            'bg-slate-50 text-slate-900 placeholder:text-slate-400',
            'dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500',
            'focus:outline-none',
            error
              ? 'border-red-300 ring-2 ring-red-100 focus:border-red-500 focus:ring-red-100 dark:border-red-800 dark:ring-red-900/30 dark:focus:border-red-500'
              : [
                  'border-slate-200 dark:border-slate-800',
                  'hover:border-slate-300 dark:hover:border-slate-700',
                  'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10',
                  'dark:focus:border-emerald-400 dark:focus:ring-emerald-400/10',
                ],
          )}
          {...props}
        />

        {/* Error message */}
        {error && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const textareaId = id || props.name

    return (
      <div className={cn('group', className)}>
        {/* Label */}
        <label
          htmlFor={textareaId}
          className={cn(
            'mb-2 flex items-center gap-2 text-sm font-medium transition-colors duration-200',
            error
              ? 'text-red-600 dark:text-red-400'
              : isFocused
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400',
          )}
        >
          <span
            className={cn(
              'font-mono text-xs transition-colors',
              error
                ? 'text-red-400 dark:text-red-500'
                : isFocused
                  ? 'text-emerald-500'
                  : 'text-slate-300 dark:text-slate-600',
            )}
          >
            $
          </span>
          {label}
        </label>

        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          className={cn(
            'block w-full resize-none rounded-lg border px-4 py-3 text-sm transition-all duration-200',
            'bg-slate-50 text-slate-900 placeholder:text-slate-400',
            'dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500',
            'focus:outline-none',
            error
              ? 'border-red-300 ring-2 ring-red-100 focus:border-red-500 focus:ring-red-100 dark:border-red-800 dark:ring-red-900/30 dark:focus:border-red-500'
              : [
                  'border-slate-200 dark:border-slate-800',
                  'hover:border-slate-300 dark:hover:border-slate-700',
                  'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10',
                  'dark:focus:border-emerald-400 dark:focus:ring-emerald-400/10',
                ],
          )}
          {...props}
        />

        {/* Error message */}
        {error && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
