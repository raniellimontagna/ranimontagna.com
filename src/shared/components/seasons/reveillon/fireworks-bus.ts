/**
 * How the rest of the New Year layer asks the sky for fireworks: the name, the virada
 * and the waves game talk to the one canvas through here.
 */
export type FireworksCommand =
  | { type: 'launch'; x: number; y: number; from?: { x: number; y: number } }
  | { type: 'finale'; ms: number }

const listeners = new Set<(command: FireworksCommand) => void>()

export const fireworksBus = {
  launchAt(x: number, y: number, from?: { x: number; y: number }) {
    for (const listener of listeners) listener({ type: 'launch', x, y, from })
  },
  finale(ms: number) {
    for (const listener of listeners) listener({ type: 'finale', ms })
  },
  subscribe(listener: (command: FireworksCommand) => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
