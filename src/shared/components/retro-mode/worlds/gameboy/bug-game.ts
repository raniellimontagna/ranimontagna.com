'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { playTones, type Tone } from '../world-sound'

export const GAME_COLS = 8
export const GAME_ROWS = 6
const ROUND_SECONDS = 30
const BUG_COUNT = 3
const BEST_KEY = 'retro-gameboy-best'

export type Cell = { x: number; y: number }
export type Bug = Cell & { id: number }
export type GamePhase = 'playing' | 'paused' | 'over'
export type GameButton = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start'

const CATCH: Tone[] = [
  { f: 1046.5, at: 0, d: 0.05, type: 'square', v: 0.025 },
  { f: 1318.5, at: 0.05, d: 0.05, type: 'square', v: 0.025 },
  { f: 1568, at: 0.1, d: 0.1, type: 'square', v: 0.025 },
]
const STEP: Tone[] = [{ f: 1200, at: 0, d: 0.025, type: 'square', v: 0.012 }]
const OVER: Tone[] = [
  { f: 784, at: 0, d: 0.15, type: 'square', v: 0.025 },
  { f: 659, at: 0.15, d: 0.15, type: 'square', v: 0.025 },
  { f: 523, at: 0.3, d: 0.15, type: 'square', v: 0.025 },
  { f: 392, at: 0.45, d: 0.4, type: 'square', v: 0.025 },
]

const same = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y
const clamp = (value: number, max: number) => Math.max(0, Math.min(max - 1, value))

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

/**
 * Caça-bugs: walk the 8 × 6 screen and squash the bugs before the deploy
 * timer runs out. Bugs wander; every catch spawns a new one somewhere free.
 */
export function useBugGame(onExit: () => void) {
  const [phase, setPhase] = useState<GamePhase>('playing')
  const [player, setPlayer] = useState<Cell>({ x: 3, y: 3 })
  const [bugs, setBugs] = useState<Bug[]>([])
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(ROUND_SECONDS)
  const [best, setBest] = useState(0)
  const nextId = useRef(1)
  const random = useRef(Math.random)

  const spawn = useCallback((taken: Cell[]): Bug => {
    for (let tries = 0; tries < 60; tries++) {
      const cell = {
        x: Math.floor(random.current() * GAME_COLS),
        y: Math.floor(random.current() * GAME_ROWS),
      }
      if (!taken.some((other) => same(other, cell))) return { ...cell, id: nextId.current++ }
    }
    return { x: 0, y: 0, id: nextId.current++ }
  }, [])

  const restart = useCallback(() => {
    const start = { x: 3, y: 3 }
    const fresh: Bug[] = []
    for (let i = 0; i < BUG_COUNT; i++) fresh.push(spawn([start, ...fresh]))
    setPlayer(start)
    setBugs(fresh)
    setScore(0)
    setTime(ROUND_SECONDS)
    setPhase('playing')
  }, [spawn])

  useEffect(() => {
    setBest(readBest())
    restart()
  }, [restart])

  // The clock and the wandering bugs.
  useEffect(() => {
    if (phase !== 'playing') return
    const clock = window.setInterval(() => setTime((value) => Math.max(0, value - 1)), 1000)
    const wander = window.setInterval(() => {
      setBugs((list) => {
        return list.map((bug) => {
          if (random.current() < 0.45) return bug
          const dir = Math.floor(random.current() * 4)
          return {
            ...bug,
            x: clamp(bug.x + (dir === 0 ? 1 : dir === 1 ? -1 : 0), GAME_COLS),
            y: clamp(bug.y + (dir === 2 ? 1 : dir === 3 ? -1 : 0), GAME_ROWS),
          }
        })
      })
    }, 650)
    return () => {
      window.clearInterval(clock)
      window.clearInterval(wander)
    }
  }, [phase])

  // Squash whatever shares the player's cell, whoever walked into whom, then refill.
  useEffect(() => {
    if (phase !== 'playing') return
    const caught = bugs.filter((bug) => same(bug, player))
    if (caught.length === 0) return
    playTones(CATCH)
    setScore((value) => value + caught.length)
    const kept = bugs.filter((bug) => !same(bug, player))
    for (let i = 0; i < caught.length; i++) kept.push(spawn([player, ...kept]))
    setBugs(kept)
  }, [bugs, player, phase, spawn])

  useEffect(() => {
    if (phase !== 'playing' || time > 0) return
    setPhase('over')
    playTones(OVER)
    setBest((previous) => {
      const next = Math.max(previous, score)
      try {
        localStorage.setItem(BEST_KEY, String(next))
      } catch {
        // The record lasts until the page closes.
      }
      return next
    })
  }, [phase, time, score])

  const press = useCallback(
    (button: GameButton) => {
      if (button === 'b') {
        onExit()
        return
      }
      if (phase === 'over') {
        if (button === 'a' || button === 'start') restart()
        return
      }
      if (button === 'start') {
        setPhase((value) => (value === 'paused' ? 'playing' : 'paused'))
        return
      }
      if (phase !== 'playing' || button === 'a') return
      playTones(STEP)
      setPlayer((at) => ({
        x: clamp(at.x + (button === 'right' ? 1 : button === 'left' ? -1 : 0), GAME_COLS),
        y: clamp(at.y + (button === 'down' ? 1 : button === 'up' ? -1 : 0), GAME_ROWS),
      }))
    },
    [onExit, phase, restart],
  )

  return { phase, player, bugs, score, time, best, press }
}
