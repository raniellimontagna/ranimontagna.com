'use client'

import {
  type KeyboardEvent,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { Link } from '@/shared/config/i18n/navigation'
import { socialLinks } from '@/shared/lib/social-links'
import { RmLogo3D } from '@/shared/ui-2026'
import {
  canAnimate,
  closeMenuMotion,
  type MenuMotionEls,
  type Origin,
  openMenuMotion,
  recedablePage,
} from './menu-motion'
import { SITE_NAV, type SiteNavId } from './site-nav'

type SiteMenuLabels = {
  open: string
  close: string
  title: string
  socials: string
  items: Record<SiteNavId, string>
}

type Phase = 'closed' | 'open' | 'closing'

type ButtonBox = { top: number; right: number; height: number }

type Motion = {
  page: HTMLElement | null
  anims: Animation[]
  close: Animation[]
  generation: number
  pendingOpen: boolean
}

const SOCIALS = [
  socialLinks.linkedin,
  socialLinks.instagram,
  socialLinks.twitter,
  socialLinks.github,
]

const BUTTON =
  'flex items-center gap-2.5 rounded-full border border-line px-4 text-sm font-semibold text-foreground transition-colors hover:border-foreground'

/** Two bars that cross into an X. */
function Burger({ crossed }: { crossed: boolean }) {
  const bar =
    'absolute inset-x-0 h-[1.5px] rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(.65,0,.35,1)] motion-reduce:transition-none'
  return (
    <span
      aria-hidden="true"
      data-burger
      data-state={crossed ? 'open' : 'closed'}
      className="relative block h-2.5 w-4"
    >
      <i className={`${bar} top-px ${crossed ? 'translate-y-[3px] rotate-45' : ''}`} />
      <i className={`${bar} top-[7px] ${crossed ? '-translate-y-[3px] -rotate-45' : ''}`} />
    </span>
  )
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/**
 * The site menu at every size: the navigation on phones, and where the social
 * links live on desktop. It opens as a circle grown out of the Menu button
 * (opening A of the mobile round), keeps focus inside and closes on Esc.
 */
export function SiteMenu({ labels }: { labels: SiteMenuLabels }) {
  const [phase, setPhase] = useState<Phase>('closed')
  const [crossed, setCrossed] = useState(false)
  const [box, setBox] = useState<ButtonBox | null>(null)
  const phaseRef = useRef<Phase>('closed')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const originRef = useRef<Origin>({ x: 0, y: 0 })
  const motionRef = useRef<Motion>({
    page: null,
    anims: [],
    close: [],
    generation: 0,
    pendingOpen: false,
  })
  const isOpen = phase === 'open'

  const go = (next: Phase) => {
    phaseRef.current = next
    setPhase(next)
  }

  const elements = (): MenuMotionEls | null => {
    const dialog = dialogRef.current
    const bg = bgRef.current
    if (!dialog || !bg) return null
    const all = (selector: string) => [...dialog.querySelectorAll<HTMLElement>(selector)]
    return {
      page: motionRef.current.page,
      bg,
      links: all('[data-menu-rise]'),
      numbers: all('[data-menu-number]'),
      socials: all('[data-menu-social]'),
      chrome: all('[data-menu-chrome]'),
    }
  }

  /** Puts the page back in place; the overlay animations go with the overlay. */
  const releasePage = () => {
    const motion = motionRef.current
    if (motion.page) {
      for (const animation of motion.anims) {
        if ((animation.effect as KeyframeEffect | null)?.target === motion.page) animation.cancel()
      }
    }
    motion.page = null
  }

  const finishClose = (returnFocus: boolean) => {
    releasePage()
    motionRef.current.anims = []
    motionRef.current.close = []
    go('closed')
    if (returnFocus) triggerRef.current?.focus()
  }

  const openMenu = () => {
    const motion = motionRef.current
    if (phaseRef.current === 'closing') {
      // Reopened mid-close: play the close backwards and drop its ending.
      motion.generation++
      for (const animation of motion.close) {
        if (typeof animation.reverse === 'function') animation.reverse()
        else animation.cancel()
      }
      motion.close = []
      go('open')
      return
    }
    if (phaseRef.current !== 'closed') return
    const rect = triggerRef.current?.getBoundingClientRect()
    const measured = rect && rect.width > 0 ? rect : null
    originRef.current = measured
      ? { x: measured.left + measured.width / 2, y: measured.top + measured.height / 2 }
      : { x: window.innerWidth - 48, y: 48 }
    setBox(
      measured
        ? { top: measured.top, right: window.innerWidth - measured.right, height: measured.height }
        : null,
    )
    motion.pendingOpen = true
    navigator.vibrate?.(10)
    go('open')
  }

  const requestClose = ({ returnFocus = true, viaLink = false } = {}) => {
    if (phaseRef.current !== 'open') return
    const motion = motionRef.current
    // Following a link: the page has to be in place before the scroll lands.
    if (viaLink) releasePage()
    const els = elements()
    if (!els || !canAnimate(els.bg)) {
      finishClose(returnFocus)
      return
    }
    const generation = ++motion.generation
    const closing = closeMenuMotion(els, originRef.current, prefersReducedMotion())
    motion.close = closing.animations
    motion.anims.push(...closing.animations)
    go('closing')
    void closing.finished.then(() => {
      if (motionRef.current.generation === generation) finishClose(returnFocus)
    })
  }

  const toggle = () => (phaseRef.current === 'open' ? requestClose() : openMenu())

  // Before paint, so the overlay never shows up whole for a frame.
  useLayoutEffect(() => {
    const motion = motionRef.current
    if (phase !== 'open' || !motion.pendingOpen) return
    motion.pendingOpen = false
    if (!canAnimate(bgRef.current)) return
    motion.page = recedablePage()
    const els = elements()
    if (els) motion.anims.push(...openMenuMotion(els, originRef.current, prefersReducedMotion()))
  })

  const onEscape = useEffectEvent((event: globalThis.KeyboardEvent) => {
    if (event.key === 'Escape') requestClose()
  })

  useEffect(() => {
    if (!isOpen) return
    dialogRef.current?.querySelector<HTMLElement>('a, button')?.focus()
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    document.addEventListener('keydown', onEscape)
    const raf = window.requestAnimationFrame ?? ((callback: FrameRequestCallback) => setTimeout(callback, 16))
    const frame = raf(() => setCrossed(true))
    return () => {
      root.style.overflow = previous
      document.removeEventListener('keydown', onEscape)
      if (typeof frame === 'number') window.cancelAnimationFrame?.(frame)
      setCrossed(false)
    }
  }, [isOpen])

  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) return
    const focusables = dialogRef.current.querySelectorAll<HTMLElement>('a, button')
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={toggle}
        className={`${BUTTON} h-11`}
      >
        <Burger crossed={false} />
        {labels.open}
      </button>

      {/* Portaled to body: the header moves with the scroll, and a transformed
          ancestor would carry a fixed overlay with it. */}
      {phase !== 'closed'
        ? createPortal(
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={labels.title}
              data-lenis-prevent
              onKeyDown={trapFocus}
              className="fixed inset-0 z-[60] overflow-y-auto"
            >
              <div ref={bgRef} aria-hidden="true" className="fixed inset-0 bg-background" />

              {/* Sits where the Menu button is, so the button seems to stay on top. */}
              <button
                type="button"
                onClick={toggle}
                style={box ?? undefined}
                className={`${BUTTON} fixed z-10 bg-background ${box ? '' : 'top-6 right-4 h-11'}`}
              >
                <Burger crossed={crossed} />
                {isOpen ? labels.close : labels.open}
              </button>

              <div className="relative flex min-h-full flex-col px-4 pt-6 pb-8 sm:px-8 lg:px-12">
                <div className="flex h-11 items-center">
                  <span
                    data-menu-chrome
                    className="font-mono text-xs tracking-[0.2em] text-muted uppercase"
                  >
                    {labels.title}
                  </span>
                </div>

                <div
                  data-menu-chrome
                  className="pointer-events-auto absolute top-1/2 right-12 hidden -translate-y-1/2 lg:block"
                >
                  <RmLogo3D size={200} label="Ranielli Montagna" />
                </div>

                {/* On phones the links sit low, where the thumb reaches. */}
                <nav data-menu-links className="flex flex-1 flex-col pt-10 max-lg:justify-end lg:pt-12">
                  <ul className="flex flex-col gap-1 lg:gap-2">
                    {SITE_NAV.map((item, index) => (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          onClick={() => requestClose({ returnFocus: false, viaLink: true })}
                          className="group flex items-baseline gap-4 overflow-hidden py-1 text-[clamp(40px,9vw,96px)] leading-[1.02] font-semibold tracking-[-0.04em] text-foreground"
                        >
                          <span
                            aria-hidden="true"
                            data-menu-number
                            className="w-6 shrink-0 font-mono text-sm text-muted tabular-nums"
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span data-menu-rise className="inline-block">
                            <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
                              {labels.items[item.id]}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="mt-10 flex flex-col gap-3 lg:mt-12">
                  <span
                    data-menu-chrome
                    className="font-mono text-xs tracking-[0.2em] text-muted uppercase"
                  >
                    {labels.socials}
                  </span>
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:max-w-3xl">
                    {SOCIALS.map((social) => (
                      <li key={social.name} data-menu-social>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-[46px] items-center justify-between gap-2 rounded-xl border border-line px-4 text-sm font-semibold text-foreground transition-colors hover:border-foreground"
                        >
                          {social.name}
                          <span aria-hidden="true" className="text-muted">
                            ↗
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
