'use client'

import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react'
import {
  AboutFile,
  AboutThisMac,
  BlogFile,
  ContactFile,
  DiskWindow,
  MAC_EMAIL,
  ProjectsFolder,
  TrashWindow,
} from './mac/mac-apps'
import { getMacCopy } from './mac/mac-copy'
import { MacIcon, type MacIconKind, SystemMark } from './mac/mac-icons'
import { type MacMenu, MacMenuBar } from './mac/mac-menus'
import { MacBoot, MacSafeToTurnOff } from './mac/mac-screens'
import { MacWindow } from './mac/mac-window'
import { WorldControls, type WorldProps } from './world-controls'
import { useBootOnce, useWorldClock } from './world-hooks'
import { getWorldLabels } from './world-labels'
import { playTones, type Tone } from './world-sound'

type WindowId = 'hd' | 'about' | 'projects' | 'blog' | 'contact' | 'trash' | 'aboutmac'
type OpenWindow = { id: WindowId; z: number; offset: number }
type IconId = Exclude<WindowId, 'aboutmac'>

const SOUNDS: Record<'open' | 'click' | 'crumple' | 'beep', Tone[]> = {
  open: [{ f: 660, at: 0, d: 0.05, type: 'square', v: 0.015 }],
  click: [{ f: 1500, at: 0, d: 0.02, type: 'square', v: 0.012 }],
  crumple: Array.from({ length: 9 }, (_, i) => ({
    f: 300 + ((i * 397) % 900),
    at: i * 0.035,
    d: 0.03,
    type: 'sawtooth' as const,
    v: 0.02,
  })),
  beep: [{ f: 990, at: 0, d: 0.12, type: 'square', v: 0.03 }],
}

const WIDTHS: Record<WindowId, number> = {
  hd: 380,
  about: 420,
  projects: 520,
  blog: 380,
  contact: 420,
  trash: 340,
  aboutmac: 400,
}

export function MacWorld({ locale, onExit }: WorldProps) {
  const t = getWorldLabels(locale)
  const copy = getMacCopy(locale)
  const boot = useBootOnce('mac')
  const clock = useWorldClock(locale)
  const [windows, setWindows] = useState<OpenWindow[]>([])
  const [selected, setSelected] = useState<IconId | null>(null)
  const [view, setView] = useState<'icon' | 'list'>('icon')
  const [trash, setTrash] = useState<string[]>(copy.trashFiles)
  const [copied, setCopied] = useState(false)
  const [safe, setSafe] = useState(false)
  const topZ = useRef(70)

  const icons: { id: IconId; label: string; icon: MacIconKind }[] = [
    { id: 'hd', label: copy.hd, icon: 'disk' },
    { id: 'about', label: t.about, icon: 'document' },
    { id: 'projects', label: t.projects, icon: 'folder' },
    { id: 'blog', label: t.blog, icon: 'document' },
    { id: 'contact', label: t.contact, icon: 'document' },
    { id: 'trash', label: copy.trash, icon: trash.length ? 'trash-full' : 'trash' },
  ]
  const titles: Record<WindowId, string> = {
    hd: copy.hd,
    about: t.about,
    projects: t.projects,
    blog: t.blog,
    contact: t.contact,
    trash: copy.trash,
    aboutmac: copy.about,
  }
  const focusedId = windows.reduce<OpenWindow | null>(
    (top, item) => (!top || item.z > top.z ? item : top),
    null,
  )?.id

  const openWindow = useCallback((id: WindowId) => {
    topZ.current += 1
    const z = topZ.current
    setWindows((list) => {
      if (list.some((item) => item.id === id))
        return list.map((item) => (item.id === id ? { ...item, z } : item))
      playTones(SOUNDS.open)
      return [...list, { id, z, offset: list.length }]
    })
  }, [])

  const focusWindow = useCallback((id: WindowId) => {
    topZ.current += 1
    const z = topZ.current
    setWindows((list) => list.map((item) => (item.id === id ? { ...item, z } : item)))
  }, [])

  const closeWindow = useCallback((id: WindowId) => {
    setWindows((list) => list.filter((item) => item.id !== id))
  }, [])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 3000)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(MAC_EMAIL)
      setCopied(true)
      playTones(SOUNDS.click)
    } catch {
      playTones(SOUNDS.beep)
    }
  }

  function onIconClick(event: MouseEvent<HTMLButtonElement>, id: IconId) {
    const touch = (event.nativeEvent as PointerEvent).pointerType === 'touch'
    if (event.detail === 0 || touch || window.matchMedia?.('(pointer: coarse)').matches) {
      openWindow(id)
      return
    }
    setSelected(id)
  }

  const menus: MacMenu[] = [
    {
      id: 'system',
      name: copy.menus.system,
      label: <SystemMark />,
      items: [{ label: `${copy.about}…`, onSelect: () => openWindow('aboutmac') }],
    },
    {
      id: 'file',
      name: copy.menus.file,
      label: copy.menus.file,
      items: [
        { label: copy.open, onSelect: () => openWindow(selected ?? 'hd') },
        {
          label: copy.closeWindow,
          disabled: !focusedId,
          onSelect: () => focusedId && closeWindow(focusedId),
        },
        { separator: true },
        { label: copy.quit, onSelect: onExit },
      ],
    },
    {
      id: 'edit',
      name: copy.menus.edit,
      label: copy.menus.edit,
      items: [
        { label: copy.undo, disabled: true, onSelect: () => {} },
        { separator: true },
        { label: copy.copyEmail, onSelect: () => void copyEmail() },
      ],
    },
    {
      id: 'view',
      name: copy.menus.view,
      label: copy.menus.view,
      items: [
        { label: copy.byIcon, checked: view === 'icon', onSelect: () => setView('icon') },
        { label: copy.byList, checked: view === 'list', onSelect: () => setView('list') },
      ],
    },
    {
      id: 'special',
      name: copy.menus.special,
      label: copy.menus.special,
      items: [
        {
          label: copy.emptyTrash,
          disabled: trash.length === 0,
          onSelect: () => {
            setTrash([])
            playTones(SOUNDS.crumple)
          },
        },
        { separator: true },
        {
          label: copy.restart,
          onSelect: () => {
            setWindows([])
            boot.replay()
          },
        },
        {
          label: copy.shutDown,
          onSelect: () => {
            setWindows([])
            setSafe(true)
          },
        },
      ],
    },
  ]

  function content(id: WindowId) {
    switch (id) {
      case 'hd':
        return (
          <DiskWindow
            items={icons.filter((icon) => icon.id !== 'hd')}
            list={view === 'list'}
            onOpen={(target) => openWindow(target as WindowId)}
          />
        )
      case 'about':
        return <AboutFile copy={copy} locale={locale} />
      case 'projects':
        return <ProjectsFolder copy={copy} locale={locale} />
      case 'blog':
        return <BlogFile copy={copy} />
      case 'contact':
        return <ContactFile copy={copy} copied={copied} onCopy={() => void copyEmail()} />
      case 'trash':
        return <TrashWindow copy={copy} files={trash} />
      case 'aboutmac':
        return <AboutThisMac copy={copy} />
    }
  }

  return (
    <>
      {boot.booting ? <MacBoot copy={copy} onDone={boot.finish} /> : null}
      {safe ? <MacSafeToTurnOff text={copy.safe} onDone={onExit} /> : null}
      <MacMenuBar
        label="Finder"
        menus={menus}
        right={
          <span className="mac-clock" title={copy.clock}>
            {clock}
          </span>
        }
      />
      <div className="mac-desktop">
        <p>{copy.computer}</p>
        <nav aria-label={copy.desktop} className="mac-icons">
          {icons.map((icon) => (
            <button
              key={icon.id}
              type="button"
              className="mac-icon"
              data-mac-icon={icon.id}
              aria-pressed={selected === icon.id}
              onClick={(event) => onIconClick(event, icon.id)}
              onDoubleClick={() => openWindow(icon.id)}
            >
              <MacIcon kind={icon.icon} />
              <span>{icon.label}</span>
            </button>
          ))}
        </nav>
      </div>
      {windows.map((item) => (
        <MacWindow
          key={item.id}
          title={titles[item.id]}
          z={item.z}
          offset={item.offset}
          focused={item.id === focusedId}
          width={WIDTHS[item.id]}
          labels={{ close: `${copy.close} — ${titles[item.id]}`, zoom: copy.zoom }}
          onFocus={() => focusWindow(item.id)}
          onClose={() => closeWindow(item.id)}
        >
          {content(item.id)}
        </MacWindow>
      ))}
      <div className="mac-window-title">
        <span aria-hidden="true">□</span>
        <strong>Ranielli Montagna</strong>
        <span aria-hidden="true">▥</span>
      </div>
      <div className="mac-bottom">
        <span>Macintosh · {copy.portfolio}</span>
        <WorldControls locale={locale} onExit={onExit} />
      </div>
    </>
  )
}
