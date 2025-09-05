'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Monitor,
  Server,
  Palette,
  Settings,
  Download,
  MessageCircle,
  User,
  CheckCircle,
} from 'lucide-react'

export function About() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const stats = [
    { number: '3+', label: 'Anos de experiência' },
    { number: '20+', label: 'Projetos concluídos' },
    { number: '100%', label: 'Dedicação' },
  ]

  const skills = [
    {
      category: 'Frontend',
      technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'React Native'],
      icon: Monitor,
    },
    {
      category: 'Backend',
      technologies: ['Node.js', 'Express', 'PostgreSQL', 'Prisma', 'JWT'],
      icon: Server,
    },
    {
      category: 'Design',
      technologies: ['Figma', 'UI/UX', 'Prototipagem', 'Design System'],
      icon: Palette,
    },
    {
      category: 'Ferramentas',
      technologies: ['Git', 'Docker', 'VS Code', 'Postman', 'Vercel'],
      icon: Settings,
    },
  ]

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-slate-50 py-20 lg:py-32 dark:bg-slate-900"
    >
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1e293b08_1px,transparent_1px),linear-gradient(-45deg,#64748b08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 right-32 h-64 w-64 rounded-full bg-slate-200/20 blur-3xl dark:bg-slate-700/20"></div>
        <div className="absolute bottom-32 left-32 h-80 w-80 rounded-full bg-slate-300/10 blur-3xl dark:bg-slate-600/10"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div
            className={`mb-6 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-1000 dark:bg-slate-800 dark:text-slate-300 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <User className="mr-2 h-4 w-4" />
            Conheça mais sobre mim
          </div>

          <h2
            className={`mb-6 text-4xl font-bold text-slate-900 transition-all delay-200 duration-1000 sm:text-5xl lg:text-6xl dark:text-slate-100 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            Sobre <span className="text-slate-600 dark:text-slate-400">Mim</span>
          </h2>
        </div>

        <div className="mb-20 grid items-center gap-16 lg:grid-cols-2">
          <div
            className={`relative transition-all delay-400 duration-1000 ${
              mounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
            }`}
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-slate-200 opacity-20 blur transition duration-1000 dark:bg-slate-700"></div>
              <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-slate-300/30 dark:bg-slate-600/30"></div>
              <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-slate-400/20 dark:bg-slate-500/20"></div>

              <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <Image
                  src="/photo.webp"
                  alt="Ranielli Montagna"
                  width={400}
                  height={400}
                  className="w-full rounded-xl object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          <div
            className={`space-y-6 transition-all delay-600 duration-1000 ${
              mounted ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
            }`}
          >
            <div className="space-y-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                Olá! Sou{' '}
                <strong className="text-slate-900 dark:text-slate-100">Ranielli Montagna</strong>,
                um desenvolvedor full stack apaixonado por transformar ideias em soluções digitais
                inovadoras. Com mais de 3 anos de experiência, especializo-me em criar aplicações
                web e mobile que combinam funcionalidade excepcional com design intuitivo.
              </p>

              <p>
                Minha jornada começou com curiosidade sobre como as coisas funcionam na web, e desde
                então venho desenvolvendo projetos que impactam positivamente a vida das pessoas.
                Acredito que a tecnologia deve ser acessível e fazer a diferença.
              </p>

              <p>
                Quando não estou codando, você pode me encontrar explorando novas tecnologias,
                contribuindo para projetos open source, ou planejando minha próxima aventura de
                desenvolvimento.
              </p>
            </div>

            <div className="flex flex-col gap-4 pt-6 sm:flex-row">
              <a
                href="/cv_en.pdf"
                download="Curriculo-Ranielli-Montagna.pdf"
                className="group relative inline-flex items-center justify-center rounded-lg bg-slate-900 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-slate-800 hover:shadow-xl focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                <Download className="mr-2 h-5 w-5" />
                Baixar Currículo
              </a>

              <a
                href="#contato"
                className="group inline-flex items-center justify-center rounded-lg border-2 border-slate-300 bg-transparent px-8 py-4 text-lg font-medium text-slate-700 transition-all duration-300 hover:border-slate-500 hover:text-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none dark:border-slate-600 dark:text-slate-300 dark:hover:text-slate-100"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Vamos conversar
              </a>
            </div>
          </div>
        </div>

        <div
          className={`mb-20 grid grid-cols-1 gap-8 transition-all delay-800 duration-1000 md:grid-cols-3 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="group text-center"
              style={{ animationDelay: `${800 + index * 200}ms` }}
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 group-hover:scale-105 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-2 text-4xl font-bold text-slate-800 dark:text-slate-200">
                  {stat.number}
                </div>
                <div className="font-medium text-slate-600 dark:text-slate-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`transition-all delay-1000 duration-1000 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <h3 className="mb-12 text-center text-2xl font-bold text-slate-900 dark:text-slate-100">
            Minhas principais competências
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {skills.map((skill, index) => {
              const IconComponent = skill.icon
              return (
                <div
                  key={skill.category}
                  className="group rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800"
                  style={{ animationDelay: `${1000 + index * 150}ms` }}
                >
                  <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
                    <IconComponent className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                  </div>
                  <h4 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {skill.category}
                  </h4>
                  <ul className="space-y-2">
                    {skill.technologies.map((tech) => (
                      <li
                        key={tech}
                        className="flex items-center text-sm text-slate-600 dark:text-slate-400"
                      >
                        <CheckCircle className="mr-2 h-3 w-3 text-slate-400 dark:text-slate-500" />
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
