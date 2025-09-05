'use client'

import { useState } from 'react'
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
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredProjects =
    activeFilter === 'all' ? projects : projects.filter((project) => project.type === activeFilter)

  const featuredProjects = projects.filter((project) => project.featured)

  return (
    <section id="projects" className="bg-slate-50 py-20 dark:bg-slate-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold text-slate-900 sm:text-5xl dark:text-white">
            Meus{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Projetos
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300">
            Uma seleção dos meus trabalhos mais recentes, incluindo aplicações web, mobile e APIs
            que demonstram minhas habilidades técnicas.
          </p>
        </div>

        <div className="mb-16">
          <h3 className="mb-8 text-center text-2xl font-bold text-slate-900 dark:text-white">
            Projetos em Destaque
          </h3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all duration-500 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-900"
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

        <div className="mb-12 flex justify-center">
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

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all duration-500 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-900"
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

        <div className="mt-16 text-center">
          <p className="mb-6 text-slate-600 dark:text-slate-300">
            Gostou do que viu? Vamos conversar sobre seu próximo projeto!
          </p>
          <a
            href="#contact"
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
          >
            Entrar em Contato
          </a>
        </div>
      </div>
    </section>
  )
}
