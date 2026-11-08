'use client'

import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion, useScrollVelocity } from '@/shared/components/motion'
import { BrandIcon, techIcon } from '@/shared/ui-2026'

type StackMarqueeProps = {
  aiLabel: string
  productLabel: string
}

const BASE_SPEED = 0.6
const MAX_BOOST = 30
const VELOCITY_GAIN = 0.8
const BOOST_DECAY = 0.92

/** The fixed stack labels; the AI and product labels come translated as props. */
export const STACK_ITEMS = [
  'React',
  'Next.js',
  'React Native',
  'Node.js',
  'TypeScript',
  'Fastify',
  'PostgreSQL',
  'AWS',
  'Pulumi',
  'Cloudflare',
  'Svelte',
  'Claude',
  'Codex',
  'Gemini',
  'DeepSeek',
  'MCP',
] as const

function StackList({ items, loopCopy }: { items: string[]; loopCopy?: boolean }) {
  return (
    <ul
      data-loop-copy={loopCopy ? '' : undefined}
      aria-hidden={loopCopy ? 'true' : undefined}
      className="flex shrink-0 items-center"
    >
      {items.map((item) => {
        const icon = techIcon(item)
        return (
          <li
            key={item}
            className="flex items-center gap-8 pr-8 font-display text-2xl font-semibold tracking-tight whitespace-nowrap sm:text-4xl"
          >
            <span className="flex items-center gap-3">
              {icon ? <BrandIcon name={icon} className="h-[0.8em] w-[0.8em]" /> : null}
              {item}
            </span>
            <span aria-hidden="true" className="text-base opacity-60">
              ✦
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/** The stack, sliding sideways; scrolling faster pushes it faster. */
export function StackMarquee({ aiLabel, productLabel }: StackMarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const velocity = useScrollVelocity()
  const [animated, setAnimated] = useState(false)

  const items = [...STACK_ITEMS, aiLabel, productLabel]

  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    if (!root || !track || prefersReducedMotion()) return

    setAnimated(true)

    let x = 0
    let boost = 0
    let frame = 0
    let visible = true
    let half = track.scrollWidth / 2
    const measure = () => {
      half = track.scrollWidth / 2
    }

    const tick = () => {
      frame = 0
      if (!visible) return

      boost = Math.max(boost * BOOST_DECAY, Math.min(MAX_BOOST, velocity.current * VELOCITY_GAIN))
      x -= BASE_SPEED + boost
      if (half > 0 && -x >= half) x += half
      track.style.transform = `translate3d(${x}px, 0, 0)`
      frame = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true
      if (visible && !frame) frame = requestAnimationFrame(tick)
    })
    observer.observe(root)
    window.addEventListener('resize', measure)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', measure)
      track.style.transform = ''
    }
  }, [velocity])

  return (
    <div
      ref={rootRef}
      data-animated={animated ? 'true' : 'false'}
      className="overflow-hidden bg-accent py-5 text-on-accent"
    >
      <div ref={trackRef} className="flex w-max">
        <StackList items={items} />
        <StackList items={items} loopCopy />
      </div>
    </div>
  )
}
