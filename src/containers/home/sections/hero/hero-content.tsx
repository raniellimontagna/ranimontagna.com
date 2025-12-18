'use client'

import { ArrowDown } from 'lucide-react'
import { motion } from 'motion/react'
import { StaggerContainer, StaggerItem } from '@/components/animations'

interface HeroContentProps {
  skillsList: string[]
}

export function HeroAnimations({ skillsList }: HeroContentProps) {
  return (
    <>
      {/* Animated skills badges - enhances the static content */}
      <StaggerContainer staggerDelay={0.05}>
        <div className="flex flex-wrap gap-2">
          {skillsList.map((tech) => (
            <StaggerItem key={tech}>
              <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/50 dark:text-blue-300 dark:hover:border-blue-500/50 dark:hover:text-blue-200">
                {tech}
              </span>
            </StaggerItem>
          ))}
        </div>
      </StaggerContainer>
    </>
  )
}

export function ScrollIndicator() {
  return (
    <motion.div
      data-testid="scroll-down-indicator"
      className="absolute bottom-8 left-1/2 -translate-x-1/2 transform cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      onClick={() => {
        const section = document.getElementById('about')
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' })
        }
      }}
    >
      <div className="flex flex-col items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
        <span className="animate-pulse">SCROLL</span>
        <ArrowDown className="h-4 w-4 animate-bounce text-gray-500 dark:text-gray-400" />
      </div>
    </motion.div>
  )
}
