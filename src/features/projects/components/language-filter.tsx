'use client'

type LanguageFilterProps = {
  languages: readonly string[]
  value: string | null
  allLabel: string
  onChange: (language: string | null) => void
}

export function LanguageFilter({ languages, value, allLabel, onChange }: LanguageFilterProps) {
  const option =
    'rounded-full border px-4 py-1.5 font-mono text-xs transition-colors border-line text-muted hover:text-foreground aria-pressed:border-foreground aria-pressed:text-foreground'

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={value === null}
        className={option}
        onClick={() => onChange(null)}
      >
        {allLabel}
      </button>
      {languages.map((language) => (
        <button
          key={language}
          type="button"
          aria-pressed={value === language}
          className={option}
          onClick={() => onChange(language)}
        >
          {language}
        </button>
      ))}
    </div>
  )
}
