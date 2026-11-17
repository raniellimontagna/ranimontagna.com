'use client'

import { attoWhatsappHref } from '@/features/home/components/atto/atto.data'
import { Link } from '@/shared/config/i18n/navigation'
import { getWorldBio } from '../world-bio'
import { WORLD_PROJECT_LINES, WORLD_PROJECTS } from '../world-projects'
import type { MacCopy } from './mac-copy'
import { MacIcon, type MacIconKind } from './mac-icons'

export const MAC_EMAIL = 'contato@ranimontagna.com'

export function AboutFile({ copy, locale }: { copy: MacCopy; locale: string }) {
  const bio = getWorldBio(locale)
  return (
    <div className="mac-text">
      <p data-mac-autofocus tabIndex={-1}>
        {bio.lead}
      </p>
      <p>{bio.detail}</p>
      <Link href="/#about">{copy.fullStory} ›</Link>
    </div>
  )
}

export function ProjectsFolder({ copy, locale }: { copy: MacCopy; locale: string }) {
  const lines = WORLD_PROJECT_LINES[locale === 'en' || locale === 'es' ? locale : 'pt']
  return (
    <>
      <p className="mac-window-info">{copy.items(WORLD_PROJECTS.length)}</p>
      <table className="mac-list">
        <thead>
          <tr>
            <th scope="col">{copy.name}</th>
            <th scope="col">{copy.kind}</th>
          </tr>
        </thead>
        <tbody>
          {WORLD_PROJECTS.map((project) => (
            <tr key={project.slug}>
              <td>
                <MacIcon kind={project.href ? 'app' : 'document'} size={16} />
                {project.href ? (
                  project.external ? (
                    <a href={project.href} target="_blank" rel="noreferrer">
                      {project.name}
                    </a>
                  ) : (
                    <Link href={project.href}>{project.name}</Link>
                  )
                ) : (
                  <span>{project.name}</span>
                )}
                <small>{lines[project.slug]}</small>
              </td>
              <td>{project.href ? copy.application : copy.privateProject}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mac-window-foot">
        <Link href="/projects">{copy.open} /projects ›</Link>
      </p>
    </>
  )
}

export function BlogFile({ copy }: { copy: MacCopy }) {
  return (
    <div className="mac-text">
      <p>{copy.blogLead}</p>
      <Link href="/blog" prefetch={false}>
        {copy.readBlog} ›
      </Link>
    </div>
  )
}

export function ContactFile({
  copy,
  onCopy,
  copied,
}: {
  copy: MacCopy
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className="mac-text">
      <dl className="mac-contact">
        <dt>{copy.email}</dt>
        <dd>
          <a href={`mailto:${MAC_EMAIL}`}>{MAC_EMAIL}</a>{' '}
          <button type="button" className="mac-button" onClick={onCopy}>
            {copy.copyEmail}
          </button>
        </dd>
        <dt>{copy.whatsapp}</dt>
        <dd>
          <a href={attoWhatsappHref(copy.whatsappMessage)} target="_blank" rel="noreferrer">
            wa.me ›
          </a>
        </dd>
        <dt>{copy.form}</dt>
        <dd>
          <Link href="/#contact">/#contact ›</Link>
        </dd>
      </dl>
      <p className="mac-copied" role="status">
        {copied ? copy.copied : ''}
      </p>
    </div>
  )
}

export function DiskWindow({
  items,
  list,
  onOpen,
}: {
  items: { id: string; label: string; icon: MacIconKind }[]
  list: boolean
  onOpen: (id: string) => void
}) {
  return (
    <div className="mac-disk" data-list={list || undefined}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="mac-disk-item"
          onClick={() => onOpen(item.id)}
        >
          <MacIcon kind={item.icon} size={list ? 16 : 32} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}

export function TrashWindow({ copy, files }: { copy: MacCopy; files: string[] }) {
  if (files.length === 0) return <p className="mac-window-info">{copy.trashEmpty}</p>
  return (
    <>
      <p className="mac-window-info">{copy.items(files.length)}</p>
      <ul className="mac-trash-files">
        {files.map((file) => (
          <li key={file}>
            <MacIcon kind="document" size={28} />
            <span>{file}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

export function AboutThisMac({ copy }: { copy: MacCopy }) {
  const total = 8192
  const used = copy.memoryUse.reduce((sum, item) => sum + item.size, 0)
  return (
    <div className="mac-about">
      <div className="mac-about-head">
        <MacIcon kind="computer" size={40} />
        <div>
          <strong>{copy.version}</strong>
          <p>
            {copy.memory}: {total.toLocaleString()}K
            <br />
            {copy.largest}: {(total - used).toLocaleString()}K
          </p>
        </div>
      </div>
      <ul className="mac-memory">
        {copy.memoryUse.map((item) => (
          <li key={item.label}>
            <span>{item.label}</span>
            <span className="mac-memory-bar">
              <span style={{ width: `${(item.size / total) * 100}%` }} />
            </span>
            <span>{item.size.toLocaleString()}K</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
