'use client'

import { type FormEvent, type RefObject, useEffect, useState } from 'react'

type VegaComposerProps = {
  inputRef: RefObject<HTMLTextAreaElement | null>
  placeholder: string
  sendLabel: string
  disabled: boolean
  onSend: (question: string) => void
  className?: string
}

export function VegaComposer({
  inputRef,
  placeholder,
  sendLabel,
  disabled,
  onSend,
  className,
}: VegaComposerProps) {
  const [value, setValue] = useState('')

  // The empty state and the conversation each mount their own box: whichever is
  // on screen takes focus, so it never falls out of the dialog when the view switches.
  useEffect(() => {
    inputRef.current?.focus()
  }, [inputRef])

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    const question = value.trim()
    if (!question || disabled) return
    onSend(question)
    setValue('')
  }

  return (
    <form
      onSubmit={submit}
      className={`flex items-end gap-2 rounded-[22px] border border-line bg-surface py-2 pr-2 pl-4 transition-colors focus-within:border-accent ${className ?? ''}`}
    >
      <textarea
        ref={inputRef}
        rows={1}
        value={value}
        maxLength={500}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) submit(event)
        }}
        className="interactive-field-input max-h-40 min-h-[36px] flex-1 resize-none bg-transparent py-2 text-base text-foreground placeholder:text-muted"
      />
      <button
        type="submit"
        aria-label={sendLabel}
        disabled={disabled || !value.trim()}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition-transform duration-200 hover:scale-105 disabled:opacity-40"
      >
        <span aria-hidden="true">↑</span>
      </button>
    </form>
  )
}
