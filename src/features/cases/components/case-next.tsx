import { getImageProps } from 'next/image'
import { Link } from '@/shared/config/i18n/navigation'
import { SECTION_X } from '@/shared/ui-2026'
import { CASES, type CaseSlug, caseHost } from '../cases.data'
import { BrowserFrame } from './case-frames'

/** The next case: its name set huge and its first screen in a small browser that lifts on hover. */
export function CaseNext({ next, label, name }: { next: CaseSlug; label: string; name: string }) {
  const study = CASES[next]
  const { props } = getImageProps({
    src: study.hero.desk.src,
    alt: '',
    fill: true,
    sizes: '(max-width: 1023px) 80vw, 28rem',
  })

  return (
    <Link
      href={`/projects/${next}`}
      className={`${SECTION_X} press group grid gap-10 border-t border-line py-20 sm:py-28 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-end`}
    >
      <span>
        <span className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{label}</span>
        <span className="mt-4 block text-[clamp(56px,11vw,180px)] leading-[0.85] font-semibold tracking-[-0.06em] text-foreground transition-transform duration-500 group-hover:translate-x-4 motion-reduce:transition-none">
          {name} →
        </span>
      </span>
      <span
        aria-hidden="true"
        className="block w-[min(100%,28rem)] transition-transform duration-500 group-hover:-translate-y-2 motion-reduce:transition-none"
      >
        <BrowserFrame host={caseHost(study)}>
          {/* biome-ignore lint/performance/noImgElement: getImageProps already gives the optimized srcset. */}
          <img {...props} alt="" className="object-cover object-top" />
        </BrowserFrame>
      </span>
    </Link>
  )
}
