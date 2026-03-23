'use client'

import {
  SiDocker,
  SiFigma,
  SiGit,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from '@icons-pack/react-simple-icons'
import { motion } from 'motion/react'
import { useState } from 'react'

const ORBIT_DURATIONS = {
  inner: 20,
  middle: 30,
  outer: 40,
}

const skillsData = [
  // Inner Ring (Frameworks/Libs)
  { name: 'React', icon: SiReact, hex: '#61DAFB', radius: 120, ring: 'inner', angle: 0 },
  {
    name: 'Next.js',
    icon: SiNextdotjs,
    hex: '#000000',
    hexDark: '#FFFFFF',
    radius: 120,
    ring: 'inner',
    angle: 120,
  },
  { name: 'Tailwind', icon: SiTailwindcss, hex: '#06B6D4', radius: 120, ring: 'inner', angle: 240 },

  // Middle Ring (Languages & Backend)
  { name: 'Node.js', icon: SiNodedotjs, hex: '#339933', radius: 220, ring: 'middle', angle: 45 },
  {
    name: 'TypeScript',
    icon: SiTypescript,
    hex: '#3178C6',
    radius: 220,
    ring: 'middle',
    angle: 165,
  },
  {
    name: 'PostgreSQL',
    icon: SiPostgresql,
    hex: '#4169E1',
    radius: 220,
    ring: 'middle',
    angle: 285,
  },

  // Outer Ring (DevOps & Tools)
  { name: 'Docker', icon: SiDocker, hex: '#2496ED', radius: 320, ring: 'outer', angle: 0 },
  { name: 'Git', icon: SiGit, hex: '#F05032', radius: 320, ring: 'outer', angle: 120 },
  { name: 'Figma', icon: SiFigma, hex: '#F24E1E', radius: 320, ring: 'outer', angle: 240 },
]

interface Skill {
  name: string
  icon: React.ElementType
  hex: string
  hexDark?: string
  radius: number
  ring: string
  angle: number
}

function SkillNode({ skill, duration }: { skill: Skill; duration: number }) {
  const [isHovered, setIsHovered] = useState(false)
  const angleRad = (skill.angle * Math.PI) / 180
  const x = Number((Math.cos(angleRad) * skill.radius).toFixed(3))
  const y = Number((Math.sin(angleRad) * skill.radius).toFixed(3))

  return (
    <button
      type="button"
      className="group absolute pointer-events-auto cursor-default focus:outline-none"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      aria-label={`Skill: ${skill.name}`}
    >
      {/* Counter-rotation to keep the icon upright */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface/90 shadow-sm backdrop-blur-md transition-all group-hover:scale-125 group-focus:scale-125"
        style={{
          boxShadow: isHovered ? `0 0 15px ${skill.hex}` : undefined,
          borderColor: isHovered ? skill.hex : undefined,
        }}
      >
        <skill.icon
          className="h-6 w-6 text-muted transition-colors duration-300"
          style={{ color: isHovered ? skill.hex : undefined }}
        />

        {/* Tooltip */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100 pointer-events-none">
          <span className="whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-background">
            {skill.name}
          </span>
        </div>
      </motion.div>
    </button>
  )
}

export function SkillsOrbit() {
  return (
    <div className="relative flex h-125 w-full items-center justify-center overflow-hidden sm:h-150 md:h-175">
      <div className="absolute inset-0 flex scale-[0.52] items-center justify-center sm:scale-[0.65] md:scale-100">
        {/* Center Core */}
        <div className="absolute z-10 flex h-20 w-20 items-center justify-center rounded-full border border-line bg-surface/80 shadow-lg backdrop-blur-md">
          <div className="h-8 w-8 rounded-full bg-foreground shadow-[0_0_20px_var(--color-foreground)] animate-pulse" />
        </div>

        {/* Rings */}
        {['inner', 'middle', 'outer'].map((ringName, index) => {
          const radius = [120, 220, 320][index]
          const duration = ORBIT_DURATIONS[ringName as keyof typeof ORBIT_DURATIONS]
          const ringSkills = skillsData.filter((s) => s.ring === ringName)

          return (
            <motion.div
              key={ringName}
              animate={{ rotate: 360 }}
              transition={{
                duration,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                width: radius * 2,
                height: radius * 2,
              }}
              className="pointer-events-none absolute rounded-full border border-line border-dashed"
            >
              {ringSkills.map((skill) => (
                <SkillNode key={skill.name} skill={skill} duration={duration} />
              ))}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
