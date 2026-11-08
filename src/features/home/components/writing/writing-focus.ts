import type { ScrollMotion } from '@/shared/components/motion'

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const FOCUS_REACH = 0.35
const THUMB_MIN = 0.82

/**
 * Below lg, the phone take on the desktop's cursor cover: the post nearest the
 * middle of the screen is lit, with its cover at full size; the others rest
 * with the title at the large-text contrast floor and the cover at 0.82.
 * The title gets its focus in --focus and CSS maps it onto the theme floor.
 * The date never dims. Row and screen heights are measured once and on refresh.
 */
export function buildWritingFocus({ ScrollTrigger }: ScrollMotion, list: HTMLUListElement) {
  const rows = Array.from(list.querySelectorAll<HTMLElement>(':scope > li'))

  let screen = window.innerHeight

  const triggers = rows.map((row) => {
    const title = row.querySelector<HTMLElement>('[data-post-title]')
    const thumb = row.querySelector<HTMLElement>('[data-post-thumb]')
    if (thumb) thumb.style.transformOrigin = '0 50%'
    let height = row.offsetHeight

    const apply = (progress: number) => {
      const centre = screen - progress * (screen + height) + height / 2
      const focus = clamp(1 - Math.abs(centre - screen / 2) / (FOCUS_REACH * screen))
      if (title) title.style.setProperty('--focus', String(focus))
      if (thumb) thumb.style.transform = `scale(${THUMB_MIN + (1 - THUMB_MIN) * focus})`
    }

    const trigger = ScrollTrigger.create({
      trigger: row,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: ({ progress }: { progress: number }) => apply(progress),
      onRefresh: () => {
        height = row.offsetHeight
        screen = window.innerHeight
      },
    })
    apply(trigger.progress ?? 0)
    return trigger
  })

  return () => {
    for (const trigger of triggers) trigger.kill()
    for (const row of rows) {
      row.querySelector<HTMLElement>('[data-post-title]')?.style.removeProperty('--focus')
      const thumb = row.querySelector<HTMLElement>('[data-post-thumb]')
      thumb?.style.removeProperty('transform')
      thumb?.style.removeProperty('transform-origin')
    }
  }
}
