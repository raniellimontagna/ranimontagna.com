'use client'

import { type ComponentType, useCallback, useEffect, useRef, useState } from 'react'
import { openVega, VEGA_OPEN_EVENT } from '@/shared/lib/vega-events'
import { useChat } from '@/shared/store/use-chat/use-chat'

type VegaComponent = ComponentType

const loadDefaultVega = (): Promise<VegaComponent> =>
  import('@/shared/vega/vega-screen').then(({ VegaScreen }) => VegaScreen)

/**
 * Wires Vega on every page: ⌘K or Ctrl+K asks for her (or closes her when she
 * is open), and `vega:open` loads the full-screen chat lazily and opens it.
 */
export function ShellWidgets({
  loadVega = loadDefaultVega,
}: {
  loadVega?: () => Promise<VegaComponent>
}) {
  const [Vega, setVega] = useState<VegaComponent | null>(null)
  const loading = useRef<Promise<void> | null>(null)
  const setChatOpen = useChat((state) => state.setOpen)

  const open = useCallback(() => {
    loading.current ??= loadVega().then((Loaded) => setVega(() => Loaded))
    setChatOpen(true)
  }, [loadVega, setChatOpen])

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k' || (!event.metaKey && !event.ctrlKey)) return
      // Ctrl+K in a field with text is an editing shortcut (macOS: delete to end of line).
      const field = event.target
      const editing =
        (field instanceof HTMLTextAreaElement || field instanceof HTMLInputElement) &&
        field.value !== ''
      if (event.ctrlKey && !event.metaKey && editing) return
      event.preventDefault()
      // A held shortcut repeats: toggling on each repeat would flicker Vega.
      if (event.repeat) return
      if (useChat.getState().isOpen) setChatOpen(false)
      else openVega()
    }
    window.addEventListener(VEGA_OPEN_EVENT, open)
    document.addEventListener('keydown', onShortcut)
    return () => {
      window.removeEventListener(VEGA_OPEN_EVENT, open)
      document.removeEventListener('keydown', onShortcut)
    }
  }, [open, setChatOpen])

  return Vega ? <Vega /> : null
}
