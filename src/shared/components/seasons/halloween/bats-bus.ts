/** How the name asks the bat canvas for a bat out of it. */
const listeners = new Set<(point: { x: number; y: number }) => void>()

export const batsBus = {
  flyFrom(x: number, y: number) {
    for (const listener of listeners) listener({ x, y })
  },
  subscribe(listener: (point: { x: number; y: number }) => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
