import type { CycleCopy } from '../cycle.data'

export function SpecArtifact({ title, items }: CycleCopy['spec']) {
  return (
    <div className="rounded-2xl border border-line bg-surface-strong p-6 text-foreground">
      <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">spec.md</p>
      <h4 className="mt-2 text-xl font-semibold tracking-tight">{title}</h4>
      <ul className="mt-5 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} data-reveal className="flex items-start gap-3 text-base leading-snug">
            <span
              aria-hidden="true"
              className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-sm bg-accent"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
