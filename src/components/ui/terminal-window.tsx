import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TerminalWindowProps {
  children: ReactNode
  className?: string
  title?: string
}

export function TerminalWindow({ children, className, title = 'bash' }: TerminalWindowProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-950/90',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
          {title}
        </div>
        <div className="w-16" /> {/* Spacer for centering */}
      </div>
      <div className="p-6 font-mono text-sm text-slate-700 md:text-base dark:text-slate-300">
        {children}
      </div>
    </div>
  )
}
