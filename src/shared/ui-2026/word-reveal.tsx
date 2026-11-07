type WordRevealProps = {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p'
  id?: string
  className?: string
}

/**
 * A sentence split into words that `Reveal` can stagger in. The element keeps
 * the whole sentence as its accessible name; the word spans are decoration.
 */
export function WordReveal({ text, as: Tag = 'h2', id, className }: WordRevealProps) {
  const words = text.split(/\s+/).filter(Boolean)

  return (
    <Tag id={id} aria-label={text} className={className}>
      {words.map((word, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: words repeat; order is the identity.
          key={index}
          data-reveal-word
          aria-hidden="true"
          className="inline-block"
        >
          {word}
          {index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
