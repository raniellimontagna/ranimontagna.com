import Image from 'next/image'
import { cn } from '@/shared/lib/utils'

type CompanyMarkProps = {
  alt: string
  company: string
  logo: string
}

const containedCompanyMarks = new Set(['SB Sistemas', 'SBSistemas', 'Lemon Energia'])

export function CompanyMark({ alt, company, logo }: CompanyMarkProps) {
  const isContained = containedCompanyMarks.has(company) || logo.includes('sbsistemas')
  const isLemon = company === 'Lemon Energia' || logo.includes('lemon-symbol-white')

  return (
    <div
      className={cn(
        'relative isolate mx-auto h-18 w-18 shrink-0 overflow-hidden rounded-2xl border border-line/70 bg-surface shadow-sm sm:mx-0 sm:rounded-3xl lg:h-20 lg:w-20',
        isContained &&
          !isLemon &&
          'border-[#c8dfb7] bg-[#f3faef] shadow-[0_10px_28px_rgba(4,91,168,0.18)] ring-1 ring-[#a8cf46]/25 dark:border-[#c8dfb7]/80 dark:bg-[#f3faef] dark:ring-white/20',
        isLemon && 'border-[#00a859]/70 bg-[#00a859] shadow-[0_10px_28px_rgba(0,168,89,0.24)]',
      )}
      data-company-mark-treatment={isContained ? 'contained' : 'cover'}
    >
      {isContained && !isLemon ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#fbfff7] via-[#eef7ea] to-[#dcead8]"
        />
      ) : null}
      <div
        className={cn('absolute z-10', isContained ? 'inset-3' : 'inset-0')}
        data-company-mark-image-frame="true"
      >
        <Image
          src={logo}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 80px, 72px"
          className={cn('h-full w-full', isContained ? 'object-contain' : 'object-cover')}
        />
      </div>
    </div>
  )
}
