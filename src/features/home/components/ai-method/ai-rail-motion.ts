import type { ScrollMotion } from '@/shared/components/motion'

// The rail runs from 16 px under the list top to 16 px above its bottom; each
// step's node (a 12 px dot at top-4) is centred 22 px into the step.
const RAIL_INSET = 16
const NODE_OFFSET = 22

/**
 * Below lg: a line draws down the steps with the scroll and lights each step
 * once it reaches that step's node, the phone take on the lg light-up.
 */
export function buildAiRail({ ScrollTrigger }: ScrollMotion, list: HTMLOListElement) {
  const fill = list.parentElement?.querySelector<HTMLElement>('[data-ai-rail-fill]') ?? null
  const items = Array.from(list.querySelectorAll<HTMLElement>('[data-ai-step]'))
  let railHeight = 0
  let nodes: number[] = []

  const measure = () => {
    railHeight = Math.max(0, list.offsetHeight - RAIL_INSET * 2)
    nodes = items.map((item) => item.offsetTop + NODE_OFFSET)
  }
  const update = (progress: number) => {
    const reach = RAIL_INSET + progress * railHeight
    if (fill) fill.style.transform = `scaleY(${progress})`
    items.forEach((item, index) => {
      item.dataset.lit = String(progress > 0 && nodes[index] <= reach)
    })
  }

  measure()
  const trigger = ScrollTrigger.create({
    trigger: list,
    start: 'top 72%',
    end: 'bottom 72%',
    onUpdate: ({ progress }: { progress: number }) => update(progress),
    onRefresh: measure,
  })

  return () => {
    trigger.kill()
    fill?.style.removeProperty('transform')
    for (const item of items) item.dataset.lit = 'true'
  }
}
