import type { ScrollMotion } from '@/shared/components/motion'
import type { ChapterId } from './cycle.data'

type Gsap = ScrollMotion['gsap']

const MESSAGE_DELAYS = [0, 0.35, 0.9]
const BOX_START = 300
const BOX_STEP = 320
const LINE_START = 200
const LINE_STEP = 230

// Pending timed steps per artifact, so a reset (or a second prepare) cancels them.
const pending = new WeakMap<HTMLElement, number[]>()

const messages = (art: HTMLElement) => art.querySelectorAll<HTMLElement>('p[data-reveal]')
const boxes = (art: HTMLElement) => art.querySelectorAll<HTMLElement>('[data-spec-box]')
const lines = (art: HTMLElement) => art.querySelectorAll<HTMLElement>('[data-terminal-line]')
const frames = (art: HTMLElement) => art.querySelectorAll<HTMLElement>('[data-reveal]')

function cancel(art: HTMLElement) {
  for (const id of pending.get(art) ?? []) window.clearTimeout(id)
  pending.delete(art)
}

function later(art: HTMLElement, delay: number, step: () => void) {
  const ids = pending.get(art) ?? []
  ids.push(window.setTimeout(step, delay))
  pending.set(art, ids)
}

/** Puts a chapter's artifact in its "before" state, right before it plays. */
export function prepareArtifact(kind: ChapterId, art: HTMLElement, gsap: Gsap): void {
  cancel(art)
  switch (kind) {
    case 'pain':
      gsap.set(messages(art), { y: 10, opacity: 0 })
      break
    case 'solution':
      for (const box of boxes(art)) box.dataset.checked = 'false'
      break
    case 'product': {
      const [screen, phone] = frames(art)
      if (screen) gsap.set(screen, { scale: 0.94, opacity: 0 })
      if (phone) gsap.set(phone, { y: 40, rotation: -4, opacity: 0 })
      break
    }
    case 'code':
      for (const line of lines(art)) line.hidden = true
      break
  }
}

/** Plays the artifact once its chapter settles at the top of the screen. */
export function playArtifact(kind: ChapterId, art: HTMLElement, gsap: Gsap): void {
  switch (kind) {
    case 'pain':
      messages(art).forEach((message, index) => {
        const delay = MESSAGE_DELAYS[index] ?? MESSAGE_DELAYS[MESSAGE_DELAYS.length - 1]
        gsap.to(message, { y: 0, opacity: 1, duration: 0.45, ease: 'expo.out', delay })
      })
      break
    case 'solution':
      boxes(art).forEach((box, index) => {
        later(art, BOX_START + index * BOX_STEP, () => {
          box.dataset.checked = 'true'
        })
      })
      break
    case 'product': {
      const [screen, phone] = frames(art)
      if (screen) gsap.to(screen, { scale: 1, opacity: 1, duration: 0.7, ease: 'expo.out' })
      if (phone)
        gsap.to(phone, {
          y: 0,
          rotation: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'expo.out',
          delay: 0.15,
        })
      break
    }
    case 'code':
      lines(art).forEach((line, index) => {
        later(art, LINE_START + index * LINE_STEP, () => {
          line.hidden = false
        })
      })
      break
  }
}

/** Back to the server state: everything visible, nothing pending. */
export function resetArtifact(kind: ChapterId, art: HTMLElement, gsap: Gsap): void {
  cancel(art)
  switch (kind) {
    case 'pain':
      gsap.set(messages(art), { clearProps: 'transform,opacity' })
      break
    case 'solution':
      for (const box of boxes(art)) box.dataset.checked = 'true'
      break
    case 'product':
      gsap.set(frames(art), { clearProps: 'transform,opacity' })
      break
    case 'code':
      for (const line of lines(art)) line.hidden = false
      break
  }
}
