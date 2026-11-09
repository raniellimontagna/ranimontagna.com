import type { ReactNode } from 'react'
import { StaticImage } from '@/shared/components/ui/static-image/static-image'
import type { CaseMedia } from '../cases.data'
import { CaseVideo } from './case-video'

/** A browser window: the address bar, then a screen with the capture's exact shape (1440×900). */
export function BrowserFrame({ host, children }: { host: string; children: ReactNode }) {
  return (
    <div
      data-browser-frame
      className="overflow-hidden rounded-[0.6rem] border border-line-strong bg-canvas shadow-2xl shadow-black/25 sm:rounded-[0.9rem]"
    >
      <div className="flex h-7 items-center border-b border-line px-3 sm:h-9">
        <span className="mx-auto max-w-full truncate rounded-full bg-background px-3 font-mono text-xs leading-5 text-muted">
          {host}
        </span>
      </div>
      <div className="relative aspect-[16/10] bg-background">{children}</div>
    </div>
  )
}

/** A phone: a thin bezel around a screen with the capture's exact shape (390×844). */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      data-phone-frame
      className="rounded-[1.6rem] bg-canvas p-[4px] shadow-2xl shadow-black/35 ring-1 ring-line-strong sm:rounded-[2.2rem] sm:p-[6px]"
    >
      <div className="relative aspect-[390/844] overflow-hidden rounded-[1.35rem] bg-background sm:rounded-[1.8rem]">
        {children}
      </div>
    </div>
  )
}

type ScreenProps = {
  media: CaseMedia
  alt: string
  sizes: string
  priority?: boolean
  /** A loop plays only while this query matches. */
  videoQuery?: string
  /** The tour plays and pauses the loop. */
  managed?: boolean
}

/**
 * One capture filling its frame: the still (optimized, preloaded when it is
 * the LCP), and for a loop the video laid over it, which the still is the
 * first frame of.
 */
export function Screen({ media, alt, sizes, priority, videoQuery, managed }: ScreenProps) {
  return (
    <>
      <StaticImage
        src={media.src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover object-top"
      />
      {media.video ? <CaseVideo src={media.video} query={videoQuery} managed={managed} /> : null}
    </>
  )
}

export const DESK_SIZES = '(max-width: 1023px) 90vw, 60vw'
export const PHONE_SIZES = '(max-width: 1023px) 45vw, 18vw'
