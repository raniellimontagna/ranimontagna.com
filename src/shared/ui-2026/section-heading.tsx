import { WordReveal } from './word-reveal'

type SectionHeadingProps = {
  id?: string
  kicker: string
  title: string
  lead?: string
}

export function SectionHeading({ id, kicker, title, lead }: SectionHeadingProps) {
  return (
    <header className="flex max-w-4xl flex-col gap-4">
      <p data-reveal className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
        {kicker}
      </p>
      <WordReveal
        text={title}
        id={id ? `${id}-title` : undefined}
        className="text-[clamp(40px,6vw,96px)] leading-[0.95] font-semibold tracking-[-0.04em] text-foreground"
      />
      {lead ? (
        <p data-reveal className="max-w-2xl text-lg leading-snug text-foreground sm:text-xl">
          {lead}
        </p>
      ) : null}
    </header>
  )
}
