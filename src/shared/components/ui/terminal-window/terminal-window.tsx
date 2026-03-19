import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface TerminalWindowProps {
  children: ReactNode
  className?: string
  title?: string
}

export function TerminalWindow({ children, className, title = 'bash' }: TerminalWindowProps) {
  return (
    <div
      className={cn(
        'surface-panel overflow-hidden rounded-[1.6rem] transition-all duration-300',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 font-mono text-xs font-medium text-[color:var(--muted)]">
          {title}
        </div>
        <div className="w-16" />
      </div>
      <div className="p-6 font-mono text-sm text-[color:var(--foreground)] md:text-base">
        {children}
      </div>
    </div>
  )
}
