'use client'

import { useEffect, useState } from 'react'
import { Github, GitBranch, Star, Users, Code, TrendingUp } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

export function GitHubStats() {
  const [mounted, setMounted] = useState(false)
  const stats = {
    totalRepos: 47,
    totalStars: 156,
    totalCommits: 2847,
    totalPRs: 234,
    contributionsLastYear: 1456,
    longestStreak: 42,
    currentStreak: 12,
    topLanguages: [
      { name: 'TypeScript', percentage: 35, color: '#3178C6' },
      { name: 'JavaScript', percentage: 28, color: '#F7DF1E' },
      { name: 'React', percentage: 18, color: '#61DAFB' },
      { name: 'Node.js', percentage: 12, color: '#339933' },
      { name: 'Python', percentage: 7, color: '#3776AB' },
    ],
  }

  useEffect(() => {
    setMounted(true)
    // Aqui você pode integrar com a API do GitHub para dados reais
    // fetchGitHubStats();
  }, [])

  if (!mounted) return null

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    gradient = 'from-blue-500 to-purple-600',
  }: {
    icon: LucideIcon
    title: string
    value: string | number
    subtitle?: string
    gradient?: string
  }) => (
    <div className="group rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-lg bg-gradient-to-r p-3 ${gradient} bg-opacity-10`}>
          <Icon className={`h-6 w-6 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`} />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {subtitle && <div className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</div>}
        </div>
      </div>
      <h3 className="font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
    </div>
  )

  return (
    <section id="github" className="bg-white py-20 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold text-slate-900 sm:text-5xl dark:text-white">
            GitHub{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Statistics
            </span>
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-slate-600 dark:text-slate-300">
            Uma visão dos meus projetos, contribuições e atividade de desenvolvimento no GitHub ao
            longo dos anos.
          </p>

          {/* GitHub Profile Link */}
          <a
            href="https://github.com/RanielliMontagna"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center rounded-lg bg-slate-900 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:bg-slate-800 hover:shadow-xl dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <Github className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
            Ver Perfil Completo
          </a>
        </div>

        {/* Main Stats Grid */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Code}
            title="Repositórios Públicos"
            value={stats.totalRepos}
            subtitle="projetos criados"
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={Star}
            title="Stars Recebidas"
            value={stats.totalStars}
            subtitle="reconhecimento"
            gradient="from-yellow-500 to-orange-500"
          />
          <StatCard
            icon={GitBranch}
            title="Commits Total"
            value={stats.totalCommits}
            subtitle="linhas de código"
            gradient="from-green-500 to-emerald-600"
          />
          <StatCard
            icon={Users}
            title="Pull Requests"
            value={stats.totalPRs}
            subtitle="contribuições"
            gradient="from-purple-500 to-pink-600"
          />
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Activity Stats */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mb-6 flex items-center">
              <TrendingUp className="mr-3 h-6 w-6 text-green-600 dark:text-green-400" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Atividade Recent
              </h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Contribuições (último ano)
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Commits, PRs, Issues, Reviews
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.contributionsLastYear.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Streak Atual</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Dias consecutivos
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.currentStreak}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Maior Streak</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Recorde pessoal</div>
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.longestStreak}
                </div>
              </div>
            </div>

            {/* Contribution Graph Placeholder */}
            <div className="mt-8">
              <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">
                Contribuições dos últimos 12 meses
              </h4>
              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="grid grid-cols-53 gap-1">
                  {Array.from({ length: 371 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-sm ${
                        Math.random() > 0.7
                          ? 'bg-green-500'
                          : Math.random() > 0.5
                            ? 'bg-green-300'
                            : Math.random() > 0.3
                              ? 'bg-green-200'
                              : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                      title={`${Math.floor(Math.random() * 10)} contribuições`}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Menos</span>
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 rounded-sm bg-slate-100 dark:bg-slate-800"></div>
                    <div className="h-2 w-2 rounded-sm bg-green-200"></div>
                    <div className="h-2 w-2 rounded-sm bg-green-300"></div>
                    <div className="h-2 w-2 rounded-sm bg-green-400"></div>
                    <div className="h-2 w-2 rounded-sm bg-green-500"></div>
                  </div>
                  <span>Mais</span>
                </div>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mb-6 flex items-center">
              <Code className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Linguagens Mais Usadas
              </h3>
            </div>

            <div className="space-y-4">
              {stats.topLanguages.map((language, index) => (
                <div key={language.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="mr-3 h-3 w-3 rounded-full"
                        style={{ backgroundColor: language.color }}
                      />
                      <span className="font-medium text-slate-900 dark:text-white">
                        {language.name}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {language.percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        backgroundColor: language.color,
                        width: `${language.percentage}%`,
                        animationDelay: `${index * 200}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
              <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">
                Estatísticas Rápidas
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-center dark:border-slate-700 dark:bg-slate-900">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {new Date().getFullYear() - 2019}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">Anos codando</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-center dark:border-slate-700 dark:bg-slate-900">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">15+</div>
                  <div className="text-slate-500 dark:text-slate-400">Tecnologias</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
