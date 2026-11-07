import type { CycleCopy } from '../cycle.data'

export function ThreadArtifact({ caption, messages }: CycleCopy['thread']) {
  return (
    <figure className="flex flex-col gap-3">
      {messages.map((message) => (
        <p
          key={message.text}
          data-reveal
          className={`max-w-[85%] rounded-2xl border px-4 py-3 text-base leading-snug ${
            message.mine
              ? 'self-end border-accent bg-accent text-on-accent'
              : 'self-start border-line bg-surface-strong text-foreground'
          }`}
        >
          <small className="mb-1 block font-mono text-[11px] tracking-wide opacity-70">
            {message.from}
          </small>
          {message.text}
        </p>
      ))}
      <figcaption className="font-mono text-[11px] text-muted">{caption}</figcaption>
    </figure>
  )
}
