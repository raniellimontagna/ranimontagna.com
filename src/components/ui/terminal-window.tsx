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
        'overflow-hidden rounded-lg border border-gray-200 bg-gray-900/95 shadow-xl backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-900/90',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 text-xs font-mono text-gray-400 opacity-50">
          {title}
        </div>
        <div className="w-16" /> {/* Spacer for centering */}
      </div>
      <div className="p-6 font-mono text-sm text-gray-300 md:text-base">{children}</div>
    </div>
  )
}
