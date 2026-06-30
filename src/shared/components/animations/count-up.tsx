interface CountUpProps {
  value: number
  suffix?: string
  className?: string
  duration?: number
  delay?: number
}

export function CountUp({
  value,
  suffix = '',
  className,
  duration = 1.6,
  delay = 0,
}: CountUpProps) {
  return (
    <span
      className={className}
      data-gsap-count="true"
      data-gsap-count-value={value}
      data-gsap-count-suffix={suffix}
      data-gsap-duration={duration}
      data-gsap-delay={delay}
    >
      {`${String(value).padStart(2, '0')}${suffix}`}
    </span>
  )
}
