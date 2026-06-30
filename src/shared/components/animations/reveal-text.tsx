import { cn } from '@/shared/lib/utils'

interface RevealTextProps {
  text: string
  className?: string
  delay?: number
  stagger?: number
  mode?: 'word' | 'char'
  once?: boolean
}

export function RevealText({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  mode = 'word',
  once = true,
}: RevealTextProps) {
  const segments =
    mode === 'char'
      ? Array.from(text).map((segment) => (segment === ' ' ? '\u00A0' : segment))
      : text.split(' ')

  return (
    <span
      className={cn(
        mode === 'word' ? 'inline-flex flex-wrap gap-x-[0.28em]' : 'inline-flex flex-wrap',
        className,
      )}
      data-gsap-text="true"
      data-gsap-delay={delay}
      data-gsap-stagger-delay={stagger}
      data-gsap-once={String(once)}
    >
      {segments.map((segment, index) => (
        <span
          key={`${segment}-${index}`}
          className={mode === 'char' ? 'inline-block whitespace-pre' : 'inline-block'}
          data-gsap-text-segment="true"
        >
          {segment}
        </span>
      ))}
    </span>
  )
}
