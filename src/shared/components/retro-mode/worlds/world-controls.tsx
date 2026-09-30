import { getWorldLabels } from './world-labels'

export type WorldProps = { locale: string; onExit: () => void }

export function WorldControls({ locale, onExit }: WorldProps) {
  return (
    <button type="button" className="world-exit" data-retro-exit onClick={onExit}>
      <span aria-hidden="true">↩</span> {getWorldLabels(locale).exit}
    </button>
  )
}
