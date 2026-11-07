'use client'

import { useState } from 'react'
import type { Repository } from '@/features/projects/types/github.types'
import { LanguageFilter } from './language-filter'

type RepoListLabels = {
  all: string
  empty: string
  stars: string
  updated: string
  site: string
  filterLabel: string
}

type RepoListProps = {
  repos: readonly Repository[]
  languages: readonly string[]
  labels: RepoListLabels
  locale: string
}

export function RepoList({ repos, languages, labels, locale }: RepoListProps) {
  const [language, setLanguage] = useState<string | null>(null)
  const visible = language ? repos.filter((repo) => repo.language === language) : repos
  const date = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' })

  if (!repos.length) {
    return <p className="text-lg text-muted">{labels.empty}</p>
  }

  return (
    <div className="flex flex-col gap-8">
      <LanguageFilter
        languages={languages}
        value={language}
        allLabel={labels.all}
        onChange={setLanguage}
      />
      <ul aria-label={labels.filterLabel} className="border-t border-line">
        {visible.map((repo) => (
          <li
            key={repo.id}
            className="grid gap-2 border-b border-line py-6 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8"
          >
            <div className="flex flex-col gap-2">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start text-xl font-semibold tracking-tight text-foreground hover:text-accent sm:text-2xl"
              >
                {repo.name}
              </a>
              {repo.description ? (
                <p className="max-w-2xl text-base text-foreground">{repo.description}</p>
              ) : null}
              {repo.homepage ? (
                <a
                  href={repo.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start font-mono text-xs text-muted underline decoration-line underline-offset-4 hover:text-foreground"
                >
                  {labels.site} · {repo.homepage.replace(/^https?:\/\//, '')}
                </a>
              ) : null}
            </div>
            <p className="flex flex-wrap gap-x-4 font-mono text-xs text-muted">
              {repo.language ? <span>{repo.language}</span> : null}
              <span>
                ★ {repo.stargazers_count} {labels.stars}
              </span>
              <span>
                {labels.updated} {date.format(new Date(repo.updated_at))}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
