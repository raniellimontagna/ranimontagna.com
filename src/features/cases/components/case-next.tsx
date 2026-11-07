import { Link } from '@/shared/config/i18n/navigation'
import { SECTION_X } from '@/shared/ui-2026'
import type { CaseSlug } from '../cases.data'

export function CaseNext({ next, label, name }: { next: CaseSlug; label: string; name: string }) {
  return (
    <Link
      href={`/projects/${next}`}
      className={`${SECTION_X} group block border-t border-line py-20 sm:py-28`}
    >
      <span className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{label}</span>
      <span className="mt-4 block text-[clamp(56px,11vw,180px)] leading-[0.85] font-semibold tracking-[-0.06em] text-foreground transition-transform duration-500 group-hover:translate-x-4">
        {name} →
      </span>
    </Link>
  )
}
