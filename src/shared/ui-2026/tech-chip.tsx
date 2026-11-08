import { BrandIcon } from './brand-icon'
import { techIcon } from './brand-icons'

/** A technology pill: logo and name, or just the name in mono when there is no logo. */
export function TechChip({ label }: { label: string }) {
  const icon = techIcon(label)

  if (!icon) {
    return (
      <span className="inline-flex items-center rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
        {label}
      </span>
    )
  }

  return (
    <span className="group/chip inline-flex items-center gap-2 rounded-full border border-line py-1 pr-3 pl-2.5 text-xs text-foreground transition-colors duration-300 hover:border-accent">
      <BrandIcon
        name={icon}
        className="h-3.5 w-3.5 transition-colors duration-300 group-hover/chip:text-accent"
      />
      {label}
    </span>
  )
}
