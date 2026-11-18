'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { track } from '@/shared/lib/analytics/track'
import { fill } from '../shared/fill'
import { shareSite } from '../shared/share-site'
import { SoundIcon } from '../shared/sound-icon'
import { SoundToggle } from '../shared/sound-toggle'
import { useSlots } from '../shared/use-slots'
import { loadBloco, pickBloco, saveBloco } from './bloco'
import { getCarnavalCopy } from './carnaval-copy'
import { playBatucada } from './carnaval-sound'

const COLORS = ['magenta', 'cyan', 'green', 'yellow'] as const

/** The banner a bloco parades behind, with its name sewn on. */
function Estandarte({ name, color, founded }: { name: string; color: string; founded: string }) {
  return (
    <div className="carnaval-estandarte" data-color={color}>
      <svg viewBox="0 0 240 300" aria-hidden="true" className="carnaval-estandarte-art">
        <rect x="6" y="6" width="228" height="8" rx="4" className="carnaval-estandarte-pole" />
        <circle cx="8" cy="10" r="8" className="carnaval-estandarte-pole" />
        <circle cx="232" cy="10" r="8" className="carnaval-estandarte-pole" />
        <path d="M24 14 H216 V244 L120 292 L24 244 Z" className="carnaval-estandarte-cloth" />
        <path
          d="M36 28 H204 V236 L120 278 L36 236 Z"
          fill="none"
          className="carnaval-estandarte-trim"
        />
        {Array.from({ length: 9 }, (_, i) => {
          const t = (i + 0.5) / 9
          return (
            <g key={t} className="carnaval-estandarte-fringe">
              <circle cx={24 + 96 * t} cy={244 + 48 * t + 6} r="3.2" />
              <circle cx={216 - 96 * t} cy={244 + 48 * t + 6} r="3.2" />
            </g>
          )
        })}
      </svg>
      <div className="carnaval-estandarte-text">
        <span className="carnaval-estandarte-founded">{founded}</span>
        <strong className="carnaval-estandarte-name">{name}</strong>
      </div>
    </div>
  )
}

/**
 * Carnival's game at the end of the home page: draw a name for your street bloco and see
 * it sewn on a banner. The last name drawn stays for the season.
 */
export function BlocoGame({ locale, edition }: { locale: string; edition: number }) {
  const copy = getCarnavalCopy(locale)
  const [slot] = useSlots('[data-season-slot="play"]')
  const [index, setIndex] = useState(() => loadBloco(edition, copy.names.length))
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)

  const draw = () => {
    const next = pickBloco(copy.names.length, index, Math.random)
    setIndex(next)
    setCopied(false)
    saveBloco(edition, next)
    setMessage(fill(copy.drawn, { name: copy.names[next] }))
    playBatucada()
    track('season-bloco', { season: 'carnaval', index: next })
  }

  const share = async () => {
    if (index === null) return
    const result = await shareSite({
      locale,
      title: copy.title,
      text: fill(copy.shareText, { name: copy.names[index] }),
      copyText: true,
    })
    if (result === 'copied') setCopied(true)
  }

  if (!slot) return null
  const name = index === null ? '?' : copy.names[index]

  return createPortal(
    <section
      aria-labelledby="carnaval-bloco-title"
      className="carnaval-bloco"
      data-no-season-click
      data-bloco-game
    >
      <div className="carnaval-bloco-text">
        <h2 id="carnaval-bloco-title" className="carnaval-bloco-title">
          {copy.title}
        </h2>
        <p className="carnaval-bloco-intro">{copy.intro}</p>
        {index === null ? <p className="carnaval-bloco-waiting">{copy.waiting}</p> : null}
        <div className="carnaval-bloco-actions">
          <button type="button" onClick={draw} className="carnaval-bloco-button" data-primary>
            {index === null ? copy.draw : copy.drawAgain}
          </button>
          {index === null ? null : (
            <button type="button" onClick={share} className="carnaval-bloco-button">
              {copy.share}
            </button>
          )}
          <SoundToggle
            label={copy.sound}
            className="carnaval-bloco-sound"
            icon={(on) => <SoundIcon on={on} />}
          />
        </div>
        <p className="carnaval-bloco-copied" aria-hidden="true">
          {copied ? copy.linkCopied : ''}
        </p>
        <p role="status" className="sr-only">
          {copied ? copy.linkCopied : message}
        </p>
      </div>
      <Estandarte
        key={index ?? 'empty'}
        name={name}
        color={COLORS[(index ?? 0) % COLORS.length]}
        founded={fill(copy.founded, { year: edition })}
      />
    </section>,
    slot,
  )
}
