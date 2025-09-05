'use client'

import { useState, useEffect } from 'react'
import { Github, ExternalLink, Code, Smartphone, Globe } from 'lucide-react'

const projects = [
  {
    id: 1,
    title: 'E-commerce Mobile App',
    description:
      'Aplicativo de e-commerce completo com React Native, integrando pagamentos via PIX e cartão, sistema de cupons e notificações push.',
    image: '/projects/ecommerce-app.jpg',
    technologies: ['React Native', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe'],
    github: 'https://github.com/ranimontagna/ecommerce-app',
    demo: 'https://ecommerce-demo.ranimontagna.com',
    type: 'mobile',
    featured: true,
  },
  {
    id: 2,
    title: 'Dashboard Analytics',
    description:
      'Dashboard administrativo com visualizações de dados em tempo real, gráficos interativos e relatórios exportáveis.',
    image: '/projects/dashboard-analytics.jpg',
    technologies: ['React', 'Next.js', 'Chart.js', 'Tailwind CSS', 'Firebase'],
    github: 'https://github.com/ranimontagna/dashboard-analytics',
    demo: 'https://dashboard-demo.ranimontagna.com',
    type: 'web',
    featured: true,
  },
  {
    id: 3,
    title: 'API de Gestão Financeira',
    description:
      'API REST para gestão financeira pessoal com autenticação JWT, categorização automática de gastos e relatórios mensais.',
    image: '/projects/finance-api.jpg',
    technologies: ['Node.js', 'Express', 'PostgreSQL', 'JWT', 'Swagger'],
    github: 'https://github.com/ranimontagna/finance-api',
    demo: 'https://finance-api.ranimontagna.com/docs',
    type: 'api',
    featured: false,
  },
  {
    id: 4,
    title: 'Landing Page SaaS',
    description:
      'Landing page moderna para produto SaaS com animações fluidas, otimizada para conversão e SEO.',
    image: '/projects/saas-landing.jpg',
    technologies: ['Next.js', 'Framer Motion', 'Tailwind CSS', 'Vercel'],
    github: 'https://github.com/ranimontagna/saas-landing',
    demo: 'https://saas-landing.ranimontagna.com',
    type: 'web',
    featured: false,
  },
  {
    id: 5,
    title: 'App de Delivery',
    description:
      'Aplicativo de delivery com rastreamento em tempo real, sistema de avaliações e integração com mapas.',
    image: '/projects/delivery-app.jpg',
    technologies: ['React Native', 'Firebase', 'Google Maps', 'Redux'],
    github: 'https://github.com/ranimontagna/delivery-app',
    demo: null,
    type: 'mobile',
    featured: true,
  },
  {
    id: 6,
    title: 'Sistema de Blog CMS',
    description:
      'Sistema de gerenciamento de conteúdo para blogs com editor rich text, SEO automático e múltiplos autores.',
    image: '/projects/blog-cms.jpg',
    technologies: ['Next.js', 'Prisma', 'PostgreSQL', 'NextAuth', 'TinyMCE'],
    github: 'https://github.com/ranimontagna/blog-cms',
    demo: 'https://blog-cms.ranimontagna.com',
    type: 'web',
    featured: false,
  },
]

const filters = [
  { id: 'all', label: 'Todos', icon: Code },
  { id: 'web', label: 'Web', icon: Globe },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'api', label: 'API', icon: Code },
]

export function Projects() {
  const [mounted, setMounted] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredProjects =
    activeFilter === 'all' ? projects : projects.filter((project) => project.type === activeFilter)

  const featuredProjects = projects.filter((project) => project.featured)

  return (
    <section
      id="projects"
      className="relative overflow-hidden bg-slate-50 py-20 lg:py-32 dark:bg-slate-800/50"
    >
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1e293b08_1px,transparent_1px),linear-gradient(-45deg,#64748b08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 right-32 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-700/20"></div>
        <div className="absolute bottom-32 left-32 h-80 w-80 rounded-full bg-purple-300/10 blur-3xl dark:bg-purple-600/10"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div
            className={`mb-6 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-1000 dark:bg-slate-800 dark:text-slate-300 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <Code className="mr-2 h-4 w-4" />
            Portfólio de projetos
          </div>

          <h2
            className={`mb-6 text-4xl font-bold text-slate-900 transition-all delay-200 duration-1000 sm:text-5xl lg:text-6xl dark:text-slate-100 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            Meus{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Projetos
            </span>
          </h2>
          <p
            className={`mx-auto max-w-3xl text-xl text-slate-600 transition-all delay-400 duration-1000 dark:text-slate-300 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            Uma seleção dos meus trabalhos mais recentes, incluindo aplicações web, mobile e APIs
            que demonstram minhas habilidades técnicas.
          </p>
        </div>

        <div
          className={`mb-16 transition-all delay-600 duration-1000 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <h3 className="mb-8 text-center text-2xl font-bold text-slate-900 dark:text-white">
            Projetos em Destaque
          </h3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <div
                key={project.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-900"
                style={{ animationDelay: `${600 + index * 200}ms` }}
              >
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <div className="text-4xl font-bold text-slate-600 dark:text-slate-400">
                      {project.title
                        .split(' ')
                        .map((word) => word[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/10"></div>
                </div>

                <div className="p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        project.type === 'web'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : project.type === 'mobile'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      }`}
                    >
                      {project.type.toUpperCase()}
                    </span>
                    <div className="flex space-x-2">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                      {project.demo && (
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <h4 className="mb-3 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {project.title}
                  </h4>

                  <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`mb-12 flex justify-center transition-all delay-800 duration-1000 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="flex space-x-1 rounded-lg bg-white p-1 shadow-lg dark:bg-slate-900">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center space-x-2 rounded-md px-6 py-3 font-medium transition-all duration-300 ${
                  activeFilter === filter.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
                }`}
              >
                <filter.icon className="h-4 w-4" />
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div
          className={`grid gap-8 transition-all delay-1000 duration-1000 md:grid-cols-2 lg:grid-cols-3 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-900"
              style={{ animationDelay: `${1000 + index * 150}ms` }}
            >
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  <div className="text-4xl font-bold text-slate-600 dark:text-slate-400">
                    {project.title
                      .split(' ')
                      .map((word) => word[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/10"></div>
              </div>

              <div className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      project.type === 'web'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : project.type === 'mobile'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                    }`}
                  >
                    {project.type.toUpperCase()}
                  </span>
                  <div className="flex space-x-2">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>

                <h4 className="mb-3 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {project.title}
                </h4>

                <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`mt-16 text-center transition-all delay-1200 duration-1000 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <p className="mb-6 text-slate-600 dark:text-slate-300">
            Gostou do que viu? Vamos conversar sobre seu próximo projeto!
          </p>
          <a
            href="#contact"
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
          >
            Entrar em Contato
          </a>
        </div>
      </div>
    </section>
  )
}
