'use client'

import { useEffect } from 'react'
import { useSkippableTimer } from '../world-hooks'
import { playTones } from '../world-sound'
import { type Bug, type Cell, GAME_COLS, GAME_ROWS, type GamePhase } from './bug-game'
import type { GameBoyCopy } from './gameboy-copy'

/** 8 × 8 pixel art, one string per row, X for a lit pixel. */
const SPRITES = {
  bug: [
    '..X..X..',
    '...XX...',
    '.XXXXXX.',
    'X.XXXX.X',
    '.XXXXXX.',
    'X.XXXX.X',
    '.X.XX.X.',
    'X......X',
  ],
  dev: [
    '..XXXX..',
    '.X....X.',
    'X.X..X.X',
    'X......X',
    'X.X..X.X',
    'X..XX..X',
    '.X....X.',
    '..XXXX..',
  ],
}

function Sprite({ kind }: { kind: keyof typeof SPRITES }) {
  const d = SPRITES[kind]
    .flatMap((row, y) => [...row].map((pixel, x) => (pixel === 'X' ? `M${x} ${y}h1v1h-1z` : '')))
    .join('')
  return (
    <svg viewBox="0 0 8 8" className={`gameboy-sprite gameboy-sprite-${kind}`} aria-hidden="true">
      <path d={d} fill="currentColor" />
    </svg>
  )
}

const DING = [
  { f: 1760, at: 0, d: 0.07, type: 'square' as const, v: 0.03 },
  { f: 2637, at: 0.08, d: 0.6, type: 'square' as const, v: 0.03 },
]

/** The logo slides down the blank screen, the console dings, the menu comes up. */
export function GameBoyBoot({ onDone }: { onDone: () => void }) {
  useSkippableTimer(true, 2700, onDone)
  useEffect(() => {
    const ding = window.setTimeout(() => playTones(DING), 1700)
    return () => window.clearTimeout(ding)
  }, [])
  return (
    <div className="gameboy-boot" aria-hidden="true">
      <p className="gameboy-boot-logo">RANI BOY</p>
    </div>
  )
}

export function BugGameScreen({
  copy,
  phase,
  player,
  bugs,
  score,
  time,
  best,
}: {
  copy: GameBoyCopy
  phase: GamePhase
  player: Cell
  bugs: Bug[]
  score: number
  time: number
  best: number
}) {
  const cells = []
  for (let y = 0; y < GAME_ROWS; y++) {
    for (let x = 0; x < GAME_COLS; x++) {
      const isPlayer = player.x === x && player.y === y
      const bug = bugs.find((item) => item.x === x && item.y === y)
      cells.push(
        <span key={`${x}-${y}`} className="gameboy-cell">
          {isPlayer ? <Sprite kind="dev" /> : bug ? <Sprite kind="bug" /> : null}
        </span>,
      )
    }
  }

  return (
    <div className="gameboy-game">
      <div className="gameboy-game-hud" aria-hidden="true">
        <span>
          {copy.bugs} {String(score).padStart(2, '0')}
        </span>
        <span>
          {copy.time} {String(time).padStart(2, '0')}
        </span>
      </div>
      <div className="gameboy-game-board" aria-hidden="true">
        {cells}
        {phase !== 'playing' ? (
          <div className="gameboy-game-overlay">
            {phase === 'paused' ? (
              <p>{copy.paused}</p>
            ) : (
              <>
                <p>{copy.over}</p>
                <p>
                  {copy.bugs} {score} · {copy.best} {best}
                </p>
                <p>{copy.again}</p>
              </>
            )}
          </div>
        ) : null}
      </div>
      <p className="sr-only" role="status">
        {phase === 'over' ? copy.overStatus(score, best) : copy.status(score)}
      </p>
    </div>
  )
}
