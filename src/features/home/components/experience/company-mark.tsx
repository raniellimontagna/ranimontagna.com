import Image from 'next/image'
import { cn } from '@/shared/lib/utils'

type CompanyMarkProps = {
  alt: string
  company: string
  logo: string
}

const companyMarkTones: Record<string, string> = {
  Luizalabs:
    'from-[#f6f6ff] via-[#fdfdff] to-[#f1f3ff] dark:from-[#161824] dark:via-[#141826] dark:to-[#11131d]',
  Smarten:
    'from-[#fff8ef] via-[#fffdf9] to-[#eef8f1] dark:from-[#1f1711] dark:via-[#191612] dark:to-[#132019]',
  'SB Sistemas':
    'from-[#eef8ff] via-[#f8fcff] to-[#f5fff2] dark:from-[#101922] dark:via-[#111822] dark:to-[#121b16]',
}

export function CompanyMark({ alt, company, logo }: CompanyMarkProps) {
  return (
    <div
      className={cn(
        'relative isolate mx-auto flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.65rem] border border-line/80 p-3 shadow-sm ring-1 ring-white/60 dark:ring-white/6 sm:mx-0 sm:h-16 sm:w-16 sm:rounded-3xl sm:p-2.5',
        'bg-linear-to-br',
        companyMarkTones[company] ?? 'from-surface via-surface to-background/70',
      )}
    >
      <div className="absolute inset-0 bg-radial-[circle_at_top] from-white/55 via-transparent to-transparent opacity-80 dark:from-white/8" />
      <div className="absolute -right-4 -bottom-4 h-10 w-10 rounded-full bg-accent/10 blur-2xl" />
      <Image
        src={logo}
        alt={alt}
        width={72}
        height={72}
        className="relative z-10 h-auto w-auto max-h-10 max-w-13 object-contain sm:max-h-9 sm:max-w-[2.9rem]"
      />
    </div>
  )
}
