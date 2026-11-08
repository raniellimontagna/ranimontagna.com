import type { TerminalLine } from '../cycle.data'

// A terminal keeps a terminal's colors in every theme.
const LINE_COLOR: Record<TerminalLine['kind'], string> = {
  prompt: 'text-[#f4f1e8]',
  note: 'text-[#8b918d]',
  add: 'text-[#9be27a]',
  fail: 'text-[#ff8a7a]',
  ok: 'text-[#d9ff5a]',
}

export function TerminalArtifact({ lines }: { lines: readonly TerminalLine[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#2a2e2c] bg-[#0b0d0c]">
      <div aria-hidden="true" className="flex gap-1.5 border-b border-[#2a2e2c] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#3a3f3c]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3a3f3c]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3a3f3c]" />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed sm:text-[13px] max-lg:flex max-lg:max-h-[38svh] max-lg:flex-col max-lg:justify-end max-lg:overflow-hidden">
        {lines.map((line) => (
          <span key={line.text} data-terminal-line className={`block ${LINE_COLOR[line.kind]}`}>
            {line.text}
          </span>
        ))}
        <span
          data-terminal-cursor
          aria-hidden="true"
          className="text-[#d9ff5a] motion-safe:animate-pulse"
        >
          ▍
        </span>
      </pre>
    </div>
  )
}
