/** How the name asks the token canvas for a burst of tokens out of it. */
const listeners = new Set<(point: { x: number; y: number }) => void>()

export const tokensBus = {
  burstAt(x: number, y: number) {
    for (const listener of listeners) listener({ x, y })
  },
  subscribe(listener: (point: { x: number; y: number }) => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
