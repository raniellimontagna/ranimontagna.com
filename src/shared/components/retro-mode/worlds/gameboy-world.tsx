'use client'

import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import { useRouter } from '@/shared/config/i18n/navigation'
import { type GameButton, useBugGame } from './gameboy/bug-game'
import { type GameBoyCopy, getGameBoyCopy } from './gameboy/gameboy-copy'
import { BugGameScreen, GameBoyBoot } from './gameboy/gameboy-parts'
import { WorldControls, type WorldProps } from './world-controls'
import { useBootOnce } from './world-hooks'
import { getWorldLabels } from './world-labels'
import { playTones, type Tone } from './world-sound'

type Button = GameButton | 'select'
type Palette = 'dmg' | 'pocket' | 'light'

const PALETTES: Palette[] = ['dmg', 'pocket', 'light']
const PALETTE_KEY = 'retro-gameboy-palette'

const SOUNDS: Record<'move' | 'open' | 'back' | 'start' | 'off', Tone[]> = {
  move: [{ f: 1318.5, at: 0, d: 0.03, type: 'square', v: 0.015 }],
  open: [
    { f: 1046.5, at: 0, d: 0.05, type: 'square', v: 0.02 },
    { f: 1568, at: 0.05, d: 0.09, type: 'square', v: 0.02 },
  ],
  back: [
    { f: 784, at: 0, d: 0.05, type: 'square', v: 0.02 },
    { f: 523.25, at: 0.05, d: 0.08, type: 'square', v: 0.02 },
  ],
  start: [
    { f: 523.25, at: 0, d: 0.08, type: 'square', v: 0.02 },
    { f: 659.25, at: 0.08, d: 0.08, type: 'square', v: 0.02 },
    { f: 783.99, at: 0.16, d: 0.08, type: 'square', v: 0.02 },
    { f: 1046.5, at: 0.24, d: 0.2, type: 'square', v: 0.02 },
  ],
  off: [{ f: 220, at: 0, d: 0.25, type: 'triangle', v: 0.04 }],
}

/** Mounted only while the game runs, so every START begins a fresh round. */
function GameSession({
  copy,
  onExit,
  register,
}: {
  copy: GameBoyCopy
  onExit: () => void
  register: (press: ((button: GameButton) => void) | null) => void
}) {
  const game = useBugGame(onExit)
  useEffect(() => {
    register(game.press)
    return () => register(null)
  }, [game.press, register])
  return <BugGameScreen copy={copy} {...game} />
}

function readPalette(): Palette {
  try {
    const saved = sessionStorage.getItem(PALETTE_KEY)
    return PALETTES.includes(saved as Palette) ? (saved as Palette) : 'dmg'
  } catch {
    return 'dmg'
  }
}

const isTextField = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

export function GameBoyWorld({ locale, onExit }: WorldProps) {
  const router = useRouter()
  const labels = getWorldLabels(locale)
  const t = getGameBoyCopy(locale)
  const boot = useBootOnce('gameboy')
  const [power, setPower] = useState(true)
  const [screen, setScreen] = useState<'menu' | 'game'>('menu')
  const [palette, setPalette] = useState<Palette>('dmg')
  const [pressed, setPressed] = useState<Button | null>(null)
  const [selected, setSelected] = useState(0)
  const [opened, setOpened] = useState<string | null>(null)
  const gamePress = useRef<((button: GameButton) => void) | null>(null)
  const flashTimer = useRef<number | undefined>(undefined)
  const menu = [
    { label: labels.about, href: '/#about' },
    { label: labels.projects, href: '/projects' },
    { label: labels.blog, href: '/blog' },
    { label: labels.contact, href: '/#contact' },
  ] as const
  const on = power && !boot.booting

  useEffect(() => {
    setPalette(readPalette())
    return () => window.clearTimeout(flashTimer.current)
  }, [])

  const registerGame = useCallback((press: ((button: GameButton) => void) | null) => {
    gamePress.current = press
  }, [])
  const leaveGame = useCallback(() => {
    setScreen('menu')
    playTones(SOUNDS.back)
  }, [])

  const selectItem = (index: number) => {
    setSelected((index + menu.length) % menu.length)
    setOpened(null)
  }

  const openSelection = () => {
    const item = menu[selected]
    setOpened(item.label)
    playTones(SOUNDS.open)
    router.push(item.href)
  }

  const returnToMenu = () => {
    setSelected(0)
    setOpened(null)
  }

  function flash(button: Button) {
    setPressed(button)
    window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setPressed(null), 140)
  }

  function press(button: Button) {
    flash(button)
    if (!on) return
    if (button === 'select') {
      const next = PALETTES[(PALETTES.indexOf(palette) + 1) % PALETTES.length]
      setPalette(next)
      try {
        sessionStorage.setItem(PALETTE_KEY, next)
      } catch {
        // The colors last for this visit only.
      }
      playTones(SOUNDS.move)
      return
    }
    if (screen === 'game') {
      gamePress.current?.(button)
      return
    }
    switch (button) {
      case 'up':
      case 'left':
        playTones(SOUNDS.move)
        selectItem(selected - 1)
        break
      case 'down':
      case 'right':
        playTones(SOUNDS.move)
        selectItem(selected + 1)
        break
      case 'a':
        openSelection()
        break
      case 'b':
        playTones(SOUNDS.back)
        returnToMenu()
        break
      case 'start':
        playTones(SOUNDS.start)
        setScreen('game')
        break
    }
  }

  function togglePower() {
    if (power) {
      playTones(SOUNDS.off)
      setPower(false)
      setScreen('menu')
      return
    }
    setPower(true)
    if (!prefersReducedMotion()) boot.replay()
  }

  const handleConsoleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, openWithEnter = false) => {
    if (screen === 'game') return
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    const keys: Record<string, Button> = {
      ArrowUp: 'up',
      ArrowLeft: 'left',
      ArrowDown: 'down',
      ArrowRight: 'right',
      a: 'a',
      A: 'a',
      x: 'a',
      X: 'a',
      b: 'b',
      B: 'b',
      z: 'b',
      Z: 'b',
      Escape: 'b',
    }
    if (event.key === 'Enter') {
      if (!openWithEnter) return
      event.preventDefault()
      press('a')
      return
    }
    const button = keys[event.key]
    if (!button) return
    event.preventDefault()
    press(button)
  }

  const pressRef = useRef(press)
  pressRef.current = press

  // While the game runs, the keyboard drives it from anywhere outside a text field.
  useEffect(() => {
    if (screen !== 'game') return
    const keys: Record<string, GameButton> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      x: 'a',
      X: 'a',
      a: 'a',
      A: 'a',
      z: 'b',
      Z: 'b',
      b: 'b',
      B: 'b',
      Escape: 'b',
      p: 'start',
      P: 'start',
    }
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || isTextField(event.target)) return
      const button =
        event.key === 'Enter' && !(event.target instanceof HTMLButtonElement)
          ? 'start'
          : keys[event.key]
      if (!button) return
      event.preventDefault()
      pressRef.current(button)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen])

  const buttonProps = (button: Button) => ({
    'data-pressed': pressed === button || undefined,
    onKeyDown: handleConsoleKeyDown,
  })

  return (
    <>
      <section className="retro-chrome gameboy-world" aria-label={t.console}>
        <div className="gameboy-console">
          <div className="gameboy-case-ridge" aria-hidden="true" />
          <button
            type="button"
            className="gameboy-power"
            aria-pressed={power}
            aria-label={t.power}
            onClick={togglePower}
          >
            <span aria-hidden="true">◀ OFF · ON</span>
          </button>
          <div className="gameboy-screen-frame">
            <p className="gameboy-screen-label">{t.screen}</p>
            <div className="gameboy-battery" aria-hidden="true">
              <span data-on={power || undefined} />
              <span>{t.battery}</span>
            </div>
            <div className="gameboy-screen" data-palette={palette} data-off={!power || undefined}>
              {!power ? (
                <p className="sr-only" role="status">
                  {t.off}
                </p>
              ) : boot.booting ? (
                <GameBoyBoot onDone={boot.finish} />
              ) : screen === 'game' ? (
                <GameSession copy={t} onExit={leaveGame} register={registerGame} />
              ) : (
                <>
                  <div className="gameboy-screen-heading">
                    <span aria-hidden="true">▣</span>
                    <strong>RANI BOY</strong>
                    <span aria-hidden="true">▣</span>
                  </div>
                  <nav aria-label={t.menu}>
                    <ol className="gameboy-menu">
                      {menu.map((item, index) => (
                        <li key={item.href}>
                          <button
                            type="button"
                            aria-pressed={index === selected}
                            onFocus={() => selectItem(index)}
                            onClick={() => selectItem(index)}
                            onKeyDown={(event) => handleConsoleKeyDown(event, true)}
                          >
                            <span className="gameboy-cursor" aria-hidden="true">
                              {index === selected ? '▶' : ''}
                            </span>
                            <span>{item.label}</span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  </nav>
                  <p className="gameboy-press-start" aria-hidden="true">
                    {t.pressStart}
                  </p>
                  <p className="gameboy-screen-status" role="status" aria-live="polite">
                    {opened ? `${t.opening} ${opened}` : t.ready}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="gameboy-brand" aria-hidden="true">
            <span>RANI</span> <strong>BOY</strong>
            <span className="gameboy-brand-rule" />
          </div>
          <div className="gameboy-controls">
            <div className="gameboy-dpad">
              <button
                type="button"
                className="gameboy-pad-up"
                aria-label={t.previous}
                onClick={() => press('up')}
                {...buttonProps('up')}
              >
                <span aria-hidden="true">▲</span>
              </button>
              <button
                type="button"
                className="gameboy-pad-left"
                aria-label={t.left}
                onClick={() => press('left')}
                {...buttonProps('left')}
              >
                <span aria-hidden="true">◀</span>
              </button>
              <span className="gameboy-pad-center" aria-hidden="true">
                ●
              </span>
              <button
                type="button"
                className="gameboy-pad-right"
                aria-label={t.right}
                onClick={() => press('right')}
                {...buttonProps('right')}
              >
                <span aria-hidden="true">▶</span>
              </button>
              <button
                type="button"
                className="gameboy-pad-down"
                aria-label={t.next}
                onClick={() => press('down')}
                {...buttonProps('down')}
              >
                <span aria-hidden="true">▼</span>
              </button>
            </div>
            <div className="gameboy-action-buttons">
              <button
                type="button"
                className="gameboy-button-b"
                aria-label={`B — ${t.back}`}
                onClick={() => press('b')}
                {...buttonProps('b')}
              >
                B
              </button>
              <button
                type="button"
                className="gameboy-button-a"
                aria-label={`A — ${t.open}`}
                onClick={() => press('a')}
                {...buttonProps('a')}
              >
                A
              </button>
            </div>
          </div>
          <div className="gameboy-menu-buttons">
            <button
              type="button"
              aria-label={t.select}
              onClick={() => press('select')}
              {...buttonProps('select')}
            >
              <span aria-hidden="true" />
              SELECT
            </button>
            <button
              type="button"
              aria-label={t.start}
              onClick={() => press('start')}
              {...buttonProps('start')}
            >
              <span aria-hidden="true" />
              START
            </button>
          </div>
          <p className="gameboy-keyboard-hint">{t.hint}</p>
          <div className="gameboy-case-bottom">
            <span className="gameboy-cartridge-label">{t.cartridge}</span>
            <div className="gameboy-speaker" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </section>
      <div className="retro-chrome gameboy-world-bar">
        <WorldControls locale={locale} onExit={onExit} />
        <span aria-hidden="true">RANI BOY · {t.palettes[palette]}</span>
      </div>
    </>
  )
}
