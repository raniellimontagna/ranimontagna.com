'use client'

import { lazy, type ReactNode, Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { useRetroMode } from '@/shared/store/use-retro-mode/use-retro-mode'
import { getRetroCopy } from './retro-copy'
import { WorldControls } from './worlds/world-controls'

const worlds = {
  '1998': lazy(() =>
    import('./worlds/web98-world').then((module) => ({ default: module.Web98World })),
  ),
  xp: lazy(() => import('./worlds/xp-world').then((module) => ({ default: module.XpWorld }))),
  dos: lazy(() => import('./worlds/dos-world').then((module) => ({ default: module.DosWorld }))),
  gameboy: lazy(() =>
    import('./worlds/gameboy-world').then((module) => ({ default: module.GameBoyWorld })),
  ),
  newspaper: lazy(() =>
    import('./worlds/newspaper-world').then((module) => ({ default: module.NewspaperWorld })),
  ),
  ide: lazy(() => import('./worlds/ide-world').then((module) => ({ default: module.IdeWorld }))),
  mac: lazy(() => import('./worlds/mac-world').then((module) => ({ default: module.MacWorld }))),
}

function WorldFocus({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.querySelector<HTMLElement>('[data-retro-exit]')?.focus({ preventScroll: true })
  }, [])
  return children
}

export function RetroExperience({ locale }: { locale: string }) {
  const active = useRetroMode((state) => state.active)
  const mode = useRetroMode((state) => state.mode)
  const init = useRetroMode((state) => state.init)
  const setActive = useRetroMode((state) => state.setActive)
  const returnFocus = useRef<HTMLElement | null>(null)
  const previouslyActive = useRef(false)
  const t = getRetroCopy(locale)
  const World = mode ? worlds[mode] : null
  const exit = () => setActive(false)
  const activated =
    locale === 'en'
      ? `${mode} mode activated.`
      : locale === 'es'
        ? `Modo ${mode} activado.`
        : `Modo ${mode} ativado.`

  useEffect(() => {
    init()
  }, [init])
  useLayoutEffect(() => {
    if (active) {
      if (!previouslyActive.current)
        returnFocus.current =
          document.activeElement instanceof HTMLElement &&
          document.activeElement !== document.body &&
          !document.activeElement.closest('.retro-chrome')
            ? document.activeElement
            : null
    } else if (!active && previouslyActive.current) {
      const target = returnFocus.current?.isConnected
        ? returnFocus.current
        : document.getElementById('main-content')
      target?.focus({ preventScroll: true })
    }
    previouslyActive.current = active
  }, [active])

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite">
        {active ? (mode === '1998' ? t.restored : activated) : ''}
      </div>
      {World && (
        <Suspense
          fallback={
            <div className="world-loading">
              <span>Ranielli Montagna</span>
              <WorldControls locale={locale} onExit={exit} />
            </div>
          }
        >
          <WorldFocus key={mode}>
            <World locale={locale} onExit={exit} />
          </WorldFocus>
        </Suspense>
      )}
    </>
  )
}
