'use client'

import Image from 'next/image'
import { type FormEvent, useId, useState } from 'react'
import { attoWhatsappHref } from '@/features/home/components/atto/atto.data'
import { Link } from '@/shared/config/i18n/navigation'
import type { XpCopy } from './xp-copy'
import { XP_PROJECT_LINES, XP_PROJECTS } from './xp-copy'
import { XpIcon } from './xp-icons'

const EMAIL = 'contato@ranimontagna.com'

export function AboutApp({ copy, onNavigate }: { copy: XpCopy; onNavigate: () => void }) {
  return (
    <div className="xp-notepad">
      <div className="xp-menubar" aria-hidden="true">
        {copy.aboutMenu.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div className="xp-notepad-page">
        <Image src="/images/avatar-112.webp" alt="" width={64} height={64} />
        <p>
          <strong>Ranielli Montagna</strong>
        </p>
        <p>{copy.aboutLead}</p>
        <p>{copy.aboutDetail}</p>
        <p>
          <Link href="/#about" prefetch={false} onClick={onNavigate} data-xp-autofocus>
            {copy.aboutMore} »
          </Link>
        </p>
        <span className="xp-caret" aria-hidden="true" />
      </div>
    </div>
  )
}

export function ProjectsApp({
  copy,
  locale,
  onNavigate,
}: {
  copy: XpCopy
  locale: string
  onNavigate: () => void
}) {
  const lines = XP_PROJECT_LINES[locale === 'en' || locale === 'es' ? locale : 'pt']
  return (
    <div className="xp-explorer-app">
      <div className="xp-address">
        <span>{copy.address}</span>
        <span className="xp-address-field">
          <XpIcon kind="folder" size={16} /> {copy.projectsAddress}
        </span>
      </div>
      <div className="xp-explorer-panes">
        <aside className="xp-taskpane">
          <p>{copy.projectsTitle}</p>
          <Link href="/projects" prefetch={false} onClick={onNavigate}>
            {copy.projectsAll}
          </Link>
        </aside>
        <ul className="xp-files">
          {XP_PROJECTS.map((project) => {
            const body = (
              <>
                <XpIcon kind={project.href ? 'folder' : 'docs'} size={40} />
                <span>
                  <strong>{project.name}</strong>
                  <small>{project.href ? lines[project.slug] : copy.privateProject}</small>
                </span>
              </>
            )
            return (
              <li key={project.slug}>
                {project.href === null ? (
                  <span className="xp-file" title={lines[project.slug]}>
                    {body}
                  </span>
                ) : project.external ? (
                  <a
                    className="xp-file"
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {body}
                  </a>
                ) : (
                  <Link
                    className="xp-file"
                    href={project.href}
                    prefetch={false}
                    onClick={onNavigate}
                  >
                    {body}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </div>
      <p className="xp-statusbar">{copy.objects(XP_PROJECTS.length)}</p>
    </div>
  )
}

export function ContactApp({ copy, onSent }: { copy: XpCopy; onSent: () => void }) {
  const subjectId = useId()
  const bodyId = useId()
  const [subject, setSubject] = useState(copy.subjectDefault)
  const [body, setBody] = useState('')

  function send(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams({ subject, body })
    window.location.href = `mailto:${EMAIL}?${params.toString().replaceAll('+', '%20')}`
    onSent()
  }

  return (
    <form className="xp-mail" onSubmit={send}>
      <div className="xp-mail-toolbar">
        <button type="submit" className="xp-mail-send">
          <XpIcon kind="mail" size={22} />
          {copy.send}
        </button>
        <a href={attoWhatsappHref(copy.subjectDefault)} target="_blank" rel="noopener noreferrer">
          {copy.whatsapp}
        </a>
      </div>
      <div className="xp-mail-field">
        <span>{copy.to}</span>
        <output>{EMAIL}</output>
      </div>
      <div className="xp-mail-field">
        <label htmlFor={subjectId}>{copy.subject}</label>
        <input
          id={subjectId}
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
      </div>
      <label htmlFor={bodyId} className="sr-only">
        {copy.body}
      </label>
      <textarea
        id={bodyId}
        rows={7}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        data-xp-autofocus
      />
    </form>
  )
}

export function RecycleApp({ copy, onNope }: { copy: XpCopy; onNope: () => void }) {
  const [nope, setNope] = useState(false)
  return (
    <div className="xp-recycle">
      <p>{copy.recycleNote}</p>
      <ul className="xp-files xp-files-small">
        {copy.recycleItems.map((item) => (
          <li key={item}>
            <span className="xp-file">
              <XpIcon kind="file" size={28} />
              <span>{item}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="xp-recycle-actions">
        <button
          type="button"
          className="xp-button"
          onClick={() => {
            setNope(true)
            onNope()
          }}
        >
          {copy.restoreAll}
        </button>
        <p role="status">{nope ? copy.restoreNope : ''}</p>
      </div>
    </div>
  )
}

export function RunDialog({
  copy,
  onRun,
  onCancel,
}: {
  copy: XpCopy
  onRun: (value: string) => string | null
  onCancel: () => void
}) {
  const inputId = useId()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  return (
    <form
      className="xp-run"
      onSubmit={(event) => {
        event.preventDefault()
        setError(onRun(value) ?? '')
      }}
    >
      <div className="xp-run-prompt">
        <XpIcon kind="run" size={40} />
        <p>{copy.runPrompt}</p>
      </div>
      <div className="xp-run-field">
        <label htmlFor={inputId}>{copy.runOpen}</label>
        <input
          id={inputId}
          value={value}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setValue(event.target.value)}
          data-xp-autofocus
        />
      </div>
      <p className="xp-run-error" role="alert">
        {error}
      </p>
      <div className="xp-dialog-buttons">
        <button type="submit" className="xp-button">
          {copy.ok}
        </button>
        <button type="button" className="xp-button" onClick={onCancel}>
          {copy.cancel}
        </button>
      </div>
    </form>
  )
}

export type ShutdownChoice = 'standby' | 'off' | 'restart'

export function ShutdownDialog({
  copy,
  onChoose,
  onCancel,
}: {
  copy: XpCopy
  onChoose: (choice: ShutdownChoice) => void
  onCancel: () => void
}) {
  const titleId = useId()
  const choices: { id: ShutdownChoice; label: string }[] = [
    { id: 'standby', label: copy.standBy },
    { id: 'off', label: copy.shutDown },
    { id: 'restart', label: copy.restart },
  ]
  return (
    <div className="xp-shutdown-backdrop">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="xp-shutdown"
        onKeyDown={(event) => {
          if (event.key === 'Escape') onCancel()
        }}
      >
        <header>
          <h2 id={titleId}>{copy.shutdownTitle}</h2>
          <span className="xp-shutdown-logo" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </header>
        <div className="xp-shutdown-choices">
          {choices.map((choice, index) => (
            <button
              key={choice.id}
              type="button"
              className={`xp-shutdown-choice xp-shutdown-${choice.id}`}
              onClick={() => onChoose(choice.id)}
              data-xp-autofocus={index === 1 || undefined}
              // biome-ignore lint/a11y/noAutofocus: the dialog opens on purpose and moves focus to its main action
              autoFocus={index === 1}
            >
              <span aria-hidden="true" />
              {choice.label}
            </button>
          ))}
        </div>
        <footer>
          <button type="button" className="xp-button" onClick={onCancel}>
            {copy.cancel}
          </button>
        </footer>
      </section>
    </div>
  )
}
