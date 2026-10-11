'use client'

import { DangerCircleIcon as DangerCircle } from '@solar-icons/react/linear'
// Plain clsx instead of cn(): none of the class lists below conflict, so the
// output is the same, and tailwind-merge's one-off config build (~40 ms on a
// throttled mobile CPU) stays out of the contact form's hydration.
import { clsx } from 'clsx'
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  useId,
  useState,
} from 'react'

interface BaseInputProps {
  label: string
  error?: string
  helpText?: ReactNode
  className?: string
}

interface InputProps
  extends BaseInputProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {}

interface TextareaProps
  extends BaseInputProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {}

function joinDescriptionIds(...ids: Array<string | undefined>): string | undefined {
  const description = ids.filter(Boolean).join(' ')
  return description || undefined
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      className,
      id,
      onBlur,
      onFocus,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const generatedId = useId()
    const inputId = id || props.name || generatedId
    const errorId = `${inputId}-error`
    const helpId = `${inputId}-help`
    const describedBy = joinDescriptionIds(
      ariaDescribedBy,
      helpText ? helpId : undefined,
      error ? errorId : undefined,
    )

    return (
      <div className={clsx('group', className)}>
        {/* Label */}
        <label
          htmlFor={inputId}
          className={clsx(
            'mb-2 flex items-center gap-2 text-sm font-medium transition-colors duration-200',
            error ? 'text-red-600 dark:text-red-400' : isFocused ? 'text-foreground' : 'text-muted',
          )}
        >
          <span
            aria-hidden="true"
            className={clsx(
              'font-mono text-xs transition-colors',
              error
                ? 'text-red-400 dark:text-red-500'
                : isFocused
                  ? 'text-accent'
                  : 'text-line-strong/40 dark:text-line-strong/20',
            )}
          >
            $
          </span>
          {label}
        </label>

        {/* Input */}
        <input
          {...props}
          ref={ref}
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={error ? true : ariaInvalid}
          onFocus={(e) => {
            setIsFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            onBlur?.(e)
          }}
          className={clsx(
            'block w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200',
            'bg-surface-strong text-foreground placeholder:text-secondary',
            'dark:bg-background dark:text-foreground',
            'focus:outline-none',
            error
              ? 'border-red-300 ring-2 ring-red-100 focus:border-red-500 focus:ring-red-100 dark:border-red-800 dark:ring-red-900/30 dark:focus:border-red-500'
              : [
                  'border-line',
                  'hover:border-foreground/20',
                  'focus:border-focus focus:ring-2 focus:ring-focus',
                ],
          )}
        />

        {helpText ? (
          <div id={helpId} className="mt-2 text-xs text-muted">
            {helpText}
          </div>
        ) : null}

        {/* Error message */}
        {error && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
            <DangerCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span id={errorId}>{error}</span>
          </div>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helpText,
      className,
      id,
      onBlur,
      onFocus,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const generatedId = useId()
    const textareaId = id || props.name || generatedId
    const errorId = `${textareaId}-error`
    const helpId = `${textareaId}-help`
    const describedBy = joinDescriptionIds(
      ariaDescribedBy,
      helpText ? helpId : undefined,
      error ? errorId : undefined,
    )

    return (
      <div className={clsx('group', className)}>
        {/* Label */}
        <label
          htmlFor={textareaId}
          className={clsx(
            'mb-2 flex items-center gap-2 text-sm font-medium transition-colors duration-200',
            error ? 'text-red-600 dark:text-red-400' : isFocused ? 'text-foreground' : 'text-muted',
          )}
        >
          <span
            aria-hidden="true"
            className={clsx(
              'font-mono text-xs transition-colors',
              error
                ? 'text-red-400 dark:text-red-500'
                : isFocused
                  ? 'text-accent'
                  : 'text-line-strong/40 dark:text-line-strong/20',
            )}
          >
            $
          </span>
          {label}
        </label>

        {/* Textarea */}
        <textarea
          {...props}
          ref={ref}
          id={textareaId}
          aria-describedby={describedBy}
          aria-invalid={error ? true : ariaInvalid}
          onFocus={(e) => {
            setIsFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            onBlur?.(e)
          }}
          className={clsx(
            'block w-full resize-none rounded-lg border px-4 py-3 text-sm transition-all duration-200',
            'bg-surface-strong text-foreground placeholder:text-secondary',
            'dark:bg-background dark:text-foreground',
            'focus:outline-none',
            error
              ? 'border-red-300 ring-2 ring-red-100 focus:border-red-500 focus:ring-red-100 dark:border-red-800 dark:ring-red-900/30 dark:focus:border-red-500'
              : [
                  'border-line',
                  'hover:border-foreground/20',
                  'focus:border-focus focus:ring-2 focus:ring-focus',
                ],
          )}
        />

        {helpText ? (
          <div id={helpId} className="mt-2 text-xs text-muted">
            {helpText}
          </div>
        ) : null}

        {/* Error message */}
        {error && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
            <DangerCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span id={errorId}>{error}</span>
          </div>
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
