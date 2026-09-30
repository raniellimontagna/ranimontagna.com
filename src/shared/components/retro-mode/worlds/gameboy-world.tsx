'use client'

import { type KeyboardEvent, useState } from 'react'
import { useRouter } from '@/shared/config/i18n/navigation'
import { WorldControls, type WorldProps } from './world-controls'
import { getWorldLabels } from './world-labels'

const gameBoyCopy = {
  pt: {
    console: 'Console Game Boy',
    menu: 'Menu Game Boy',
    screen: 'Portfólio · 4 cores',
    battery: 'Bateria',
    cartridge: 'Cartucho de portfólio',
    previous: 'Item anterior',
    next: 'Próximo item',
    left: 'Selecionar à esquerda',
    right: 'Selecionar à direita',
    open: 'Abrir seleção',
    back: 'Voltar ao menu',
    ready: 'Escolha uma página',
    opening: 'Abrindo:',
    hint: 'Setas escolhem · A / Enter abre · B / Esc volta',
  },
  en: {
    console: 'Game Boy console',
    menu: 'Game Boy menu',
    screen: 'Portfolio · 4 shades',
    battery: 'Battery',
    cartridge: 'Portfolio cartridge',
    previous: 'Previous item',
    next: 'Next item',
    left: 'Select to the left',
    right: 'Select to the right',
    open: 'Open selection',
    back: 'Return to menu',
    ready: 'Choose a page',
    opening: 'Opening:',
    hint: 'Arrows choose · A / Enter opens · B / Esc returns',
  },
  es: {
    console: 'Consola Game Boy',
    menu: 'Menú Game Boy',
    screen: 'Portafolio · 4 tonos',
    battery: 'Batería',
    cartridge: 'Cartucho de portafolio',
    previous: 'Elemento anterior',
    next: 'Siguiente elemento',
    left: 'Seleccionar a la izquierda',
    right: 'Seleccionar a la derecha',
    open: 'Abrir selección',
    back: 'Volver al menú',
    ready: 'Elige una página',
    opening: 'Abriendo:',
    hint: 'Flechas eligen · A / Enter abre · B / Esc vuelve',
  },
}

export function GameBoyWorld({ locale, onExit }: WorldProps) {
  const router = useRouter()
  const labels = getWorldLabels(locale)
  const t = gameBoyCopy[locale === 'en' || locale === 'es' ? locale : 'pt']
  const [selected, setSelected] = useState(0)
  const [opened, setOpened] = useState<string | null>(null)
  const menu = [
    { label: labels.about, href: '/#about' },
    { label: labels.projects, href: '/projects' },
    { label: labels.blog, href: '/blog' },
    { label: labels.contact, href: '/#contact' },
  ] as const

  const selectItem = (index: number) => {
    setSelected((index + menu.length) % menu.length)
    setOpened(null)
  }

  const openSelection = () => {
    const item = menu[selected]
    setOpened(item.label)
    router.push(item.href)
  }

  const returnToMenu = () => {
    setSelected(0)
    setOpened(null)
  }

  const handleConsoleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, openWithEnter = false) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        selectItem(selected - 1)
        break
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        selectItem(selected + 1)
        break
      case 'Enter':
        if (!openWithEnter) return
        event.preventDefault()
        openSelection()
        break
      case 'a':
      case 'A':
        event.preventDefault()
        openSelection()
        break
      case 'Escape':
      case 'b':
      case 'B':
        event.preventDefault()
        returnToMenu()
        break
    }
  }

  return (
    <>
      <section className="retro-chrome gameboy-world" aria-label={t.console}>
        <div className="gameboy-console">
          <div className="gameboy-case-ridge" aria-hidden="true" />
          <div className="gameboy-screen-frame">
            <p className="gameboy-screen-label">{t.screen}</p>
            <div className="gameboy-battery" aria-hidden="true">
              <span />
              <span>{t.battery}</span>
            </div>
            <div className="gameboy-screen">
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
              <p className="gameboy-screen-status" role="status" aria-live="polite">
                {opened ? `${t.opening} ${opened}` : t.ready}
              </p>
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
                onClick={() => selectItem(selected - 1)}
                onKeyDown={handleConsoleKeyDown}
              >
                <span aria-hidden="true">▲</span>
              </button>
              <button
                type="button"
                className="gameboy-pad-left"
                aria-label={t.left}
                onClick={() => selectItem(selected - 1)}
                onKeyDown={handleConsoleKeyDown}
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
                onClick={() => selectItem(selected + 1)}
                onKeyDown={handleConsoleKeyDown}
              >
                <span aria-hidden="true">▶</span>
              </button>
              <button
                type="button"
                className="gameboy-pad-down"
                aria-label={t.next}
                onClick={() => selectItem(selected + 1)}
                onKeyDown={handleConsoleKeyDown}
              >
                <span aria-hidden="true">▼</span>
              </button>
            </div>
            <div className="gameboy-action-buttons">
              <button
                type="button"
                className="gameboy-button-b"
                aria-label={`B — ${t.back}`}
                onClick={returnToMenu}
                onKeyDown={handleConsoleKeyDown}
              >
                B
              </button>
              <button
                type="button"
                className="gameboy-button-a"
                aria-label={`A — ${t.open}`}
                onClick={openSelection}
                onKeyDown={handleConsoleKeyDown}
              >
                A
              </button>
            </div>
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
        <span aria-hidden="true">RANI BOY · 01</span>
      </div>
    </>
  )
}
