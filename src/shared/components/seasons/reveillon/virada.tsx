'use client'

import { useEffect, useRef, useState } from 'react'
import { fill } from '../shared/fill'
import { midnightOf, viradaFromParam } from './countdown'
import { fireworksBus } from './fireworks-bus'
import { getReveillonCopy } from './reveillon-copy'
import { playAuldLangSyne } from './reveillon-sound'

const COUNT_FROM_MS = 10_000
const FINALE_MS = 8000
const GREETING_MS = 6000
/** A turn missed in a hidden tab is still celebrated if the visitor is back this soon. */
const LATE_PARTY_MS = 30 * 60_000
const RECHECK_MS = 60_000

type ViradaProps = { locale: string; edition: number; onTurn: () => void }
type Phase = 'waiting' | 'counting' | 'greeting' | 'done'

/**
 * Midnight on the 31st for whoever is on the site: the last ten seconds in a corner,
 * then a sky full of fireworks and "Happy new year" in the middle of the page, which
 * never blocks it. Screen readers hear only the greeting.
 */
export function Virada({ locale, edition, onTurn }: ViradaProps) {
  const copy = getReveillonCopy(locale)
  const [target] = useState(
    () => viradaFromParam(window.location.search, Date.now()) ?? midnightOf(edition).getTime(),
  )
  const [phase, setPhase] = useState<Phase>(() => (Date.now() >= target ? 'done' : 'waiting'))
  const [seconds, setSeconds] = useState(10)
  const onTurnRef = useRef(onTurn)

  useEffect(() => {
    onTurnRef.current = onTurn
  })

  useEffect(() => {
    if (Date.now() >= target) return
    let timer = 0
    let greetingTimer = 0
    let turned = false
    let partyOwed = false

    const party = () => {
      partyOwed = false
      setPhase('greeting')
      fireworksBus.finale(FINALE_MS)
      playAuldLangSyne()
      greetingTimer = window.setTimeout(() => setPhase('done'), GREETING_MS)
    }
    const turn = () => {
      if (turned) return
      turned = true
      onTurnRef.current()
      // Throttled timers in a hidden tab: keep the party for when the visitor is back.
      if (document.hidden) {
        partyOwed = true
        setPhase('done')
      } else party()
    }
    const tick = () => {
      const left = target - Date.now()
      if (left <= 0) return turn()
      if (left <= COUNT_FROM_MS) {
        setPhase('counting')
        setSeconds(Math.ceil(left / 1000))
        timer = window.setTimeout(tick, left % 1000 || 1000)
      } else {
        // Re-check every minute at most: a laptop that slept wakes on the right second.
        timer = window.setTimeout(tick, Math.min(left - COUNT_FROM_MS, RECHECK_MS))
      }
    }
    const onVisibility = () => {
      if (document.hidden) return
      if (partyOwed && Date.now() - target < LATE_PARTY_MS) party()
      partyOwed = false
      if (!turned) {
        window.clearTimeout(timer)
        tick()
      }
    }

    tick()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(greetingTimer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [target])

  const greeting = fill(copy.virada, { year: edition + 1 })

  return (
    <>
      <p role="status" className="sr-only">
        {phase === 'greeting' ? greeting : ''}
      </p>
      {phase === 'counting' ? (
        <span aria-hidden="true" data-virada-count className="reveillon-virada-count">
          {seconds}
        </span>
      ) : null}
      {phase === 'greeting' ? (
        <span aria-hidden="true" data-virada-greeting className="reveillon-virada-greeting">
          {greeting}
        </span>
      ) : null}
    </>
  )
}
