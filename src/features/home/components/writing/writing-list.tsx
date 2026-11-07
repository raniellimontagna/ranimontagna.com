'use client'

import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import { Link } from '@/shared/config/i18n/navigation'

export type WritingPost = { slug: string; title: string; date: string; image: string }

const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const LERP = 0.16

/**
 * Big rows; on desktop the cover follows the cursor. The follower is pure
 * decoration: every title is a real link and phones get the cover inline.
 */
export function WritingList({ posts }: { posts: WritingPost[] }) {
  const listRef = useRef<HTMLUListElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const list = listRef.current
    const follower = followerRef.current
    if (!list || !follower || !window.matchMedia(FINE_POINTER).matches || prefersReducedMotion())
      return

    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let frame = 0

    const tick = () => {
      current.x += (target.x - current.x) * LERP
      current.y += (target.y - current.y) * LERP
      follower.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`
      frame = requestAnimationFrame(tick)
    }
    const onMove = (event: PointerEvent) => {
      target.x = event.clientX
      target.y = event.clientY
      if (!frame) {
        current.x = target.x
        current.y = target.y
        frame = requestAnimationFrame(tick)
      }
    }
    const onLeave = () => {
      cancelAnimationFrame(frame)
      frame = 0
      setActive(null)
    }

    list.addEventListener('pointermove', onMove)
    list.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      list.removeEventListener('pointermove', onMove)
      list.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  const activePost = posts.find((post) => post.slug === active)

  return (
    <>
      <ul ref={listRef} className="border-t border-line">
        {posts.map((post) => (
          <li key={post.slug} data-reveal className="border-b border-line">
            <Link
              href={`/blog/${post.slug}`}
              onPointerEnter={() => setActive(post.slug)}
              onFocus={() => setActive(post.slug)}
              className="group flex items-center gap-5 py-7 sm:py-9"
            >
              {/* biome-ignore lint/performance/noImgElement: remote blog cover, decorative thumbnail. */}
              <img
                src={post.image}
                alt=""
                loading="lazy"
                className="h-16 w-24 shrink-0 rounded-[2px] object-cover lg:hidden"
              />
              <span className="flex flex-1 flex-col gap-2 lg:flex-row lg:items-baseline lg:justify-between lg:gap-10">
                <span className="text-2xl leading-tight font-semibold tracking-tight text-foreground transition-transform duration-300 group-hover:translate-x-2 sm:text-4xl">
                  {post.title}
                </span>
                <span className="shrink-0 font-mono text-xs text-muted">{post.date}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div
        ref={followerRef}
        data-cursor-image
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 z-30 hidden h-56 w-80 overflow-hidden rounded-[2px] transition-opacity duration-300 lg:block ${activePost ? 'opacity-100' : 'opacity-0'}`}
      >
        {activePost ? (
          // biome-ignore lint/performance/noImgElement: remote blog cover following the cursor.
          <img src={activePost.image} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
    </>
  )
}
