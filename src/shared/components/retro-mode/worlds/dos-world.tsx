'use client'

import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import { useRouter } from '@/shared/config/i18n/navigation'
import type { RetroMode } from '@/shared/store/use-retro-mode/retro-modes'
import { useRetroMode } from '@/shared/store/use-retro-mode/use-retro-mode'
import { RETRO_NAMES } from '../retro-secret'
import { DOS_RESUME, getDosCopy } from './dos/dos-copy'
import { DosBoot, DosMatrix, TypedLines } from './dos/dos-screens'
import { DOS_COMPLETIONS, type DosColor, parseDosCommand } from './dos-command'
import { WorldControls, type WorldProps } from './world-controls'
import { useBootOnce, useWorldClock, useWorldSound } from './world-hooks'
import { getWorldLabels } from './world-labels'
import { playTones, type Tone } from './world-sound'

type OutputEntry = { id: number; command?: string; lines: string[]; typed?: boolean }

const COLOR_ORDER: DosColor[] = ['green', 'amber', 'white', 'blue']
const COLOR_KEY = 'retro-dos-color'

const BEEP: Tone[] = [{ f: 880, at: 0, d: 0.16, type: 'square', v: 0.03 }]
const ENTER: Tone[] = [{ f: 140, at: 0, d: 0.03, type: 'square', v: 0.02 }]

function focusSection(id: 'about' | 'contact') {
  const target = document.getElementById(id)
  if (!target) return false

  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1')
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
  }
  target.scrollIntoView({ behavior: 'instant', block: 'start' })
  target.focus({ preventScroll: true })
  return true
}

function commonPrefix(words: string[]) {
  return words.reduce((prefix, word) => {
    let i = 0
    while (i < prefix.length && prefix[i] === word[i]) i++
    return prefix.slice(0, i)
  })
}

function readColor(): DosColor {
  try {
    const saved = sessionStorage.getItem(COLOR_KEY)
    return COLOR_ORDER.includes(saved as DosColor) ? (saved as DosColor) : 'green'
  } catch {
    return 'green'
  }
}

export function DosWorld({ locale, onExit }: WorldProps) {
  const t = getDosCopy(locale)
  const labels = getWorldLabels(locale)
  const router = useRouter()
  const setMode = useRetroMode((state) => state.setMode)
  const boot = useBootOnce('dos')
  const sound = useWorldSound()
  const clock = useWorldClock(locale, { second: '2-digit' })
  const inputId = useId()
  const hintId = useId()
  const input = useRef<HTMLInputElement>(null)
  const outputLog = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)
  const draft = useRef('')
  const leaving = useRef<number | undefined>(undefined)
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [color, setColor] = useState<DosColor>('green')
  const [matrix, setMatrix] = useState(false)
  const [output, setOutput] = useState<OutputEntry[]>(() => [
    { id: 0, lines: ['RANI-DOS 6.22', t.intro] },
  ])

  useEffect(() => {
    setColor(readColor())
    return () => {
      window.clearTimeout(leaving.current)
      document.documentElement.removeAttribute('data-dos-color')
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-dos-color', color)
    try {
      sessionStorage.setItem(COLOR_KEY, color)
    } catch {
      // The color lasts for this visit only.
    }
  }, [color])

  useEffect(() => {
    if (outputLog.current && output.length > 0) {
      outputLog.current.scrollTop = outputLog.current.scrollHeight
    }
  }, [output])

  // Once the BIOS hands over, the cursor waits in the prompt.
  useEffect(() => {
    if (boot.ready && !boot.booting && !matrix) input.current?.focus({ preventScroll: true })
  }, [boot.ready, boot.booting, matrix])

  const pt = locale === 'pt'
  const es = locale === 'es'
  const readme = pt ? 'leiame.txt' : es ? 'leeme.txt' : 'readme.txt'
  const suggestions = [
    { command: pt ? 'ajuda' : 'help', label: t.help },
    { command: 'dir', label: 'DIR' },
    { command: `type ${readme}`, label: readme.toUpperCase() },
    { command: pt ? 'sobre' : 'about', label: labels.about },
    { command: pt ? 'projetos' : 'projects', label: labels.projects },
    { command: 'blog', label: labels.blog },
    { command: pt ? 'contato' : 'contact', label: labels.contact },
    { command: 'color', label: 'COLOR' },
    { command: 'matrix', label: 'MATRIX' },
    { command: 'cls', label: t.clear },
  ]

  function appendOutput(typed: string | undefined, lines: string[]) {
    const entry = { id: nextId.current++, command: typed, lines, typed: true }
    setOutput((previous) => [...previous, entry].slice(-30))
  }

  function today() {
    const now = new Date()
    const weekday = new Intl.DateTimeFormat(pt ? 'pt-BR' : locale, { weekday: 'short' })
      .format(now)
      .replace('.', '')
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return locale === 'en' ? `${weekday} ${month}-${day}-1998` : `${weekday} ${day}/${month}/1998`
  }

  function goToWorld(mode: RetroMode) {
    leaving.current = window.setTimeout(
      () => {
        setMode(mode)
        window.scrollTo({ top: 0, behavior: 'instant' })
      },
      prefersReducedMotion() ? 0 : 700,
    )
  }

  function execute(value: string) {
    const typed = value.trim()
    const parsed = parseDosCommand(typed)
    if (parsed.type === 'empty') return

    playTones(ENTER)
    setHistory((previous) => [...previous, typed].slice(-50))
    setHistoryIndex(null)
    setCommand('')
    draft.current = ''

    switch (parsed.type) {
      case 'clear':
        setOutput([])
        break
      case 'exit':
        onExit()
        return
      case 'help':
        appendOutput(typed, [
          t.help,
          `help / ajuda — ${t.commands.help}`,
          `dir — ${t.commands.dir}`,
          `type ${readme} — ${t.commands.type}`,
          `cd ${pt ? 'projetos' : es ? 'proyectos' : 'projects'} — ${t.commands.cd}`,
          `sobre / about — ${labels.about}`,
          `projetos / projects — ${labels.projects}`,
          `blog — ${labels.blog}`,
          `contato / contact — ${labels.contact}`,
          `tree — ${t.commands.tree}`,
          `ver — ${t.commands.ver}`,
          `date / time — ${t.commands.date}`,
          `whoami — ${t.commands.whoami}`,
          `mem — ${t.commands.mem}`,
          `color — ${t.commands.color}`,
          `cv — ${t.commands.cv}`,
          `win — ${t.commands.win}`,
          `matrix — ${t.commands.matrix}`,
          `cls / clear — ${t.clear}`,
          `exit / sair — ${labels.exit}`,
        ])
        break
      case 'directory':
        appendOutput(typed, [
          ` ${t.directory}`,
          '',
          `${(pt ? 'LEIAME' : es ? 'LEEME' : 'README').padEnd(9)}TXT      1.998  17-11-98`,
          `${(pt ? 'SOBRE' : 'ABOUT').padEnd(9)}TXT        640  17-11-98`,
          `${(pt ? 'CONTATO' : es ? 'CONTACTO' : 'CONTACT').padEnd(9)}TXT        256  17-11-98`,
          `${'CV'.padEnd(9)}PDF     98.304  17-11-98`,
          `${(pt ? 'PROJETOS' : es ? 'PROYECTO' : 'PROJECTS').padEnd(9)}   <DIR>         17-11-98`,
          `${'BLOG'.padEnd(9)}   <DIR>         17-11-98`,
          `   4 ${t.files}   100.198 bytes`,
          `   640.000 ${t.free}`,
        ])
        break
      case 'navigate':
        appendOutput(typed, [`${t.opening}: ${labels[parsed.label]}…`])
        router.push(parsed.href)
        if (
          (parsed.label === 'about' || parsed.label === 'contact') &&
          focusSection(parsed.label)
        ) {
          return
        }
        break
      case 'up':
        appendOutput(typed, [])
        break
      case 'type':
        appendOutput(
          typed,
          parsed.file === 'contact'
            ? t.contactFile
            : parsed.file === 'about'
              ? [t.bio.lead, '', t.bio.detail]
              : [readme.toUpperCase(), '', t.bio.lead, '', t.bio.detail, '', t.tryHelp],
        )
        break
      case 'missing':
        playTones(BEEP)
        appendOutput(typed, [`${t.missing}: ${parsed.file}`])
        break
      case 'color': {
        const next =
          parsed.color ?? COLOR_ORDER[(COLOR_ORDER.indexOf(color) + 1) % COLOR_ORDER.length]
        setColor(next)
        appendOutput(typed, parsed.color ? [t.color] : [t.color, t.colorUsage])
        break
      }
      case 'version':
        appendOutput(typed, ['', t.version, ''])
        break
      case 'date':
        appendOutput(typed, [`${t.date} ${today()}`])
        break
      case 'time':
        appendOutput(typed, [`${t.time} ${new Date().toLocaleTimeString(pt ? 'pt-BR' : locale)}`])
        break
      case 'tree':
        appendOutput(typed, [
          'C:\\RANI',
          `├───${pt ? 'SOBRE' : 'ABOUT'}`,
          `├───${pt ? 'PROJETOS' : es ? 'PROYECTOS' : 'PROJECTS'}`,
          '│   ├───GRIMORY',
          '│   ├───KLICK',
          '│   └───AGENT-TOOLKIT',
          '├───BLOG',
          `└───${pt ? 'CONTATO' : es ? 'CONTACTO' : 'CONTACT'}`,
        ])
        break
      case 'whoami':
        appendOutput(typed, [t.whoami])
        break
      case 'memory':
        appendOutput(typed, ['', ...t.memory, ''])
        break
      case 'resume':
        appendOutput(typed, [t.resume])
        window.open(DOS_RESUME[pt ? 'pt' : es ? 'es' : 'en'], '_blank', 'noopener')
        break
      case 'matrix':
        appendOutput(typed, [t.matrix])
        setMatrix(true)
        return
      case 'beep':
        playTones(BEEP)
        appendOutput(typed, ['BEEP!'])
        break
      case 'format':
        playTones(BEEP)
        appendOutput(typed, t.format)
        break
      case 'echo':
        appendOutput(typed, [parsed.text || 'ECHO'])
        break
      case 'world':
        appendOutput(typed, [`${t.loading} ${RETRO_NAMES[parsed.mode]}...`])
        goToWorld(parsed.mode)
        break
      case 'unknown':
        playTones(BEEP)
        appendOutput(typed, [`${t.unknown}: ${parsed.command}`, t.tryHelp])
        break
    }

    input.current?.focus({ preventScroll: true })
  }

  function complete(event: KeyboardEvent<HTMLInputElement>) {
    const typed = command.trimStart().toLowerCase()
    if (!typed) return
    const matches = DOS_COMPLETIONS.filter((candidate) => candidate.startsWith(typed))
    if (matches.length === 0) return
    event.preventDefault()
    if (matches.length === 1) {
      setCommand(matches[0])
      return
    }
    const prefix = commonPrefix(matches)
    if (prefix.length > typed.length) setCommand(prefix)
    else appendOutput(undefined, [matches.join('   ')])
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return
    if (event.key === 'Tab' && !event.shiftKey) {
      complete(event)
      return
    }
    if (history.length === 0) return

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (historyIndex === null) draft.current = command
      const next = Math.max(0, (historyIndex ?? history.length) - 1)
      setHistoryIndex(next)
      setCommand(history[next])
    } else if (event.key === 'ArrowDown' && historyIndex !== null) {
      event.preventDefault()
      const next = historyIndex + 1
      setHistoryIndex(next < history.length ? next : null)
      setCommand(next < history.length ? history[next] : draft.current)
    }
  }

  const lastId = output.at(-1)?.id

  return (
    <>
      {boot.booting ? <DosBoot copy={t} onDone={boot.finish} /> : null}
      {matrix ? (
        <DosMatrix
          onDone={() => {
            setMatrix(false)
          }}
        />
      ) : null}
      <section className="retro-chrome dos-terminal" aria-label={t.terminal}>
        <div className="dos-titlebar">
          <span aria-hidden="true">■</span>
          <span>RANI-DOS / C:\RANI</span>
          <span className="dos-titlebar-memory" aria-hidden="true">
            640K OK
          </span>
        </div>
        <div className="dos-screen">
          <div
            ref={outputLog}
            className="dos-output"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {output.map((entry) => (
              <div className="dos-entry" key={entry.id}>
                {entry.command && <p className="dos-echo">C:\RANI&gt; {entry.command}</p>}
                <TypedLines
                  lines={entry.lines}
                  animate={Boolean(entry.typed) && entry.id === lastId}
                />
              </div>
            ))}
          </div>
          <form
            className="dos-command-form"
            onSubmit={(event) => {
              event.preventDefault()
              execute(command)
            }}
          >
            <label htmlFor={inputId} className="dos-input-label">
              {t.command}
            </label>
            <div className="dos-command-row">
              <span className="dos-prompt" aria-hidden="true">
                C:\RANI&gt;
              </span>
              <input
                ref={input}
                id={inputId}
                value={command}
                onChange={(event) => {
                  setCommand(event.target.value)
                  setHistoryIndex(null)
                }}
                onKeyDown={onKeyDown}
                aria-describedby={hintId}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={200}
              />
              <button type="submit" className="dos-run">
                {t.execute}
              </button>
            </div>
            <p id={hintId} className="dos-hint">
              {t.hint}
            </p>
          </form>
          <fieldset className="dos-shortcuts">
            <legend>{t.shortcuts}</legend>
            <div>
              {suggestions.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion.command}
                  onClick={() => execute(suggestion.command)}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </section>
      <div className="retro-chrome dos-statusbar">
        <WorldControls locale={locale} onExit={onExit} />
        <button type="button" className="dos-sound" aria-pressed={sound.on} onClick={sound.toggle}>
          {t.sound}: {sound.on ? 'ON' : 'OFF'}
        </button>
        <span className="dos-ready">
          {t.ready} <span aria-hidden="true">·</span> {clock}
        </span>
      </div>
    </>
  )
}
