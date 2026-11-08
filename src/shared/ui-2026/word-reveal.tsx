import { Fragment } from 'react'

type WordRevealProps = {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p'
  id?: string
  className?: string
}

/**
 * A sentence split into words that `Reveal` can stagger in. Assistive tech
 * reads the whole sentence from a visually hidden copy; the word spans are
 * decoration (aria-label is not reliable on paragraphs).
 */
export function WordReveal({ text, as: Tag = 'h2', id, className }: WordRevealProps) {
  const words = text.split(/\s+/).filter(Boolean)

  return (
    <Tag id={id} className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, index) => (
        // Below lg each word sits in its own mask and rises out of it (Reveal);
        // the padding keeps descenders inside the mask, the margin cancels it.
        // The space stays outside the mask: inside nested inline-blocks it collapses.
        <Fragment key={index}>
          <span
            aria-hidden="true"
            className="inline-block max-lg:-mb-[0.1em] max-lg:overflow-hidden max-lg:pb-[0.1em] max-lg:align-bottom"
          >
            <span data-reveal-word aria-hidden="true" className="inline-block">
              {word}
            </span>
          </span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  )
}
