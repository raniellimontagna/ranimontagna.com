'use client'

import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { useRouter } from '@/shared/config/i18n/navigation'
import { parseDosCommand } from './dos-command'
import { WorldControls, type WorldProps } from './world-controls'
import { getWorldLabels } from './world-labels'

const copy = {
  pt: {
    terminal: 'Terminal DOS',
    intro: 'Terminal pessoal carregado. Digite ajuda para começar.',
    command: 'Comando DOS',
    execute: 'Executar',
    shortcuts: 'Atalhos de comando',
    hint: '↑ / ↓: histórico · Enter: executar',
    help: 'Comandos disponíveis',
    directory: 'Diretório de C:\\RANI',
    clear: 'Limpar a tela',
    unknown: 'Comando não reconhecido',
    tryHelp: 'Digite ajuda para ver os comandos disponíveis.',
    opening: 'Abrindo',
    ready: 'SISTEMA PRONTO',
  },
  en: {
    terminal: 'DOS terminal',
    intro: 'Personal terminal loaded. Type help to get started.',
    command: 'DOS command',
    execute: 'Run',
    shortcuts: 'Command shortcuts',
    hint: '↑ / ↓: history · Enter: run',
    help: 'Available commands',
    directory: 'Directory of C:\\RANI',
    clear: 'Clear the screen',
    unknown: 'Command not recognized',
    tryHelp: 'Type help to see the available commands.',
    opening: 'Opening',
    ready: 'SYSTEM READY',
  },
  es: {
    terminal: 'Terminal DOS',
    intro: 'Terminal personal cargado. Escribe help para empezar.',
    command: 'Comando DOS',
    execute: 'Ejecutar',
    shortcuts: 'Atajos de comando',
    hint: '↑ / ↓: historial · Enter: ejecutar',
    help: 'Comandos disponibles',
    directory: 'Directorio de C:\\RANI',
    clear: 'Limpiar la pantalla',
    unknown: 'Comando no reconocido',
    tryHelp: 'Escribe help para ver los comandos disponibles.',
    opening: 'Abriendo',
    ready: 'SISTEMA LISTO',
  },
}

type OutputEntry = { id: number; command?: string; lines: string[] }

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

export function DosWorld({ locale, onExit }: WorldProps) {
  const t = copy[locale === 'en' || locale === 'es' ? locale : 'pt']
  const labels = getWorldLabels(locale)
  const router = useRouter()
  const inputId = useId()
  const hintId = useId()
  const input = useRef<HTMLInputElement>(null)
  const outputLog = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)
  const draft = useRef('')
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [output, setOutput] = useState<OutputEntry[]>(() => [
    { id: 0, lines: ['RANI-DOS 6.22', t.intro] },
  ])

  useEffect(() => {
    if (outputLog.current && output.length > 0) {
      outputLog.current.scrollTop = outputLog.current.scrollHeight
    }
  }, [output])

  const suggestions = [
    { command: locale === 'pt' ? 'ajuda' : 'help', label: t.help },
    { command: 'dir', label: 'DIR' },
    { command: locale === 'pt' ? 'sobre' : 'about', label: labels.about },
    { command: locale === 'pt' ? 'projetos' : 'projects', label: labels.projects },
    { command: 'blog', label: labels.blog },
    { command: locale === 'pt' ? 'contato' : 'contact', label: labels.contact },
    { command: 'cls', label: t.clear },
  ]

  function appendOutput(typed: string, lines: string[]) {
    const entry = { id: nextId.current++, command: typed, lines }
    setOutput((previous) => [...previous, entry].slice(-30))
  }

  function execute(value: string) {
    const typed = value.trim()
    const parsed = parseDosCommand(typed)
    if (parsed.type === 'empty') return

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
          `help / ajuda — ${t.help}`,
          `dir — ${t.directory}`,
          `sobre / about — ${labels.about}`,
          `projetos / projects — ${labels.projects}`,
          `blog — ${labels.blog}`,
          `contato / contact — ${labels.contact}`,
          `cls / clear — ${t.clear}`,
          `exit / sair — ${labels.exit}`,
        ])
        break
      case 'directory':
        appendOutput(typed, [
          t.directory,
          `ABOUT       <DIR>  ${labels.about}`,
          `PROJECTS    <DIR>  ${labels.projects}`,
          `BLOG        <DIR>  ${labels.blog}`,
          `CONTACT     <DIR>  ${labels.contact}`,
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
      case 'unknown':
        appendOutput(typed, [`${t.unknown}: ${parsed.command}`, t.tryHelp])
        break
    }

    input.current?.focus({ preventScroll: true })
  }

  function recallHistory(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || history.length === 0) return

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

  return (
    <>
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
                {entry.lines.map((line, index) => (
                  <p key={`${entry.id}-${index}`}>{line}</p>
                ))}
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
                onKeyDown={recallHistory}
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
        <span className="dos-ready">{t.ready}</span>
      </div>
    </>
  )
}
