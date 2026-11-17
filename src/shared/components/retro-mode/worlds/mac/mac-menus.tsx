'use client'

import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react'

export type MacMenuItem =
  | { label: string; onSelect: () => void; disabled?: boolean; checked?: boolean }
  | { separator: true }

function CheckMark({ checked }: { checked?: boolean }) {
  return (
    <span aria-hidden="true" className="mac-menu-check">
      {checked ? '✓' : ''}
    </span>
  )
}

export type MacMenu = { id: string; label: ReactNode; name: string; items: MacMenuItem[] }

/**
 * The menu bar: press a title to drop its menu, move along with the arrows,
 * Enter picks, Escape or a click elsewhere closes. Hovering switches menus
 * while one is open, like the original.
 */
export function MacMenuBar({
  label,
  menus,
  right,
}: {
  label: string
  menus: MacMenu[]
  right: ReactNode
}) {
  const [open, setOpen] = useState<string | null>(null)
  const bar = useRef<HTMLElement>(null)
  const triggers = useRef(new Map<string, HTMLButtonElement>())

  useEffect(() => {
    if (!open) return
    bar.current
      ?.querySelector<HTMLButtonElement>(`[data-menu="${open}"] [role^="menuitem"]:not([disabled])`)
      ?.focus({ preventScroll: true })
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !bar.current?.contains(event.target)) setOpen(null)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])

  function close(focusTrigger = true) {
    if (open && focusTrigger) triggers.current.get(open)?.focus({ preventScroll: true })
    setOpen(null)
  }

  function step(direction: 1 | -1) {
    const index = menus.findIndex((menu) => menu.id === open)
    setOpen(menus[(index + direction + menus.length) % menus.length].id)
  }

  function onMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    const items = [
      ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role^="menuitem"]:not([disabled])',
      ),
    ]
    const index = items.indexOf(document.activeElement as HTMLButtonElement)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      items[(index + 1) % items.length]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      items[(index - 1 + items.length) % items.length]?.focus()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close()
    } else if (event.key === 'Tab') {
      close(false)
    }
  }

  return (
    <nav ref={bar} className="mac-menubar" aria-label={label}>
      <ul className="mac-menus">
        {menus.map((menu) => (
          <li key={menu.id} data-menu={menu.id}>
            <button
              ref={(node) => {
                if (node) triggers.current.set(menu.id, node)
              }}
              type="button"
              className="mac-menu-title"
              aria-haspopup="menu"
              aria-expanded={open === menu.id}
              aria-label={typeof menu.label === 'string' ? undefined : menu.name}
              onClick={() => setOpen((value) => (value === menu.id ? null : menu.id))}
              onPointerEnter={() => {
                if (open && open !== menu.id) setOpen(menu.id)
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setOpen(menu.id)
                }
              }}
            >
              {menu.label}
            </button>
            {open === menu.id ? (
              <div className="mac-menu" role="menu" aria-label={menu.name} onKeyDown={onMenuKey}>
                {menu.items.map((item, index) => {
                  if ('separator' in item)
                    return <hr key={`sep-${index}`} className="mac-menu-separator" />
                  const select = () => {
                    setOpen(null)
                    item.onSelect()
                  }
                  return item.checked === undefined ? (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      disabled={item.disabled}
                      onClick={select}
                    >
                      <CheckMark checked={item.checked} />
                      {item.label}
                    </button>
                  ) : (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitemradio"
                      aria-checked={item.checked}
                      disabled={item.disabled}
                      onClick={select}
                    >
                      <CheckMark checked={item.checked} />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="mac-menubar-right">{right}</div>
    </nav>
  )
}
