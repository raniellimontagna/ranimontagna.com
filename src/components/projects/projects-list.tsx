'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import type { Repository } from '@/lib/github'
import { getLanguagesFromRepos } from '@/lib/github'
import { FeaturedProject } from './featured-project'
import { LanguageFilter } from './language-filter'
import { ProjectCard } from './project-card'

interface ProjectsListProps {
  featuredRepos: Repository[]
  repos: Repository[]
}

export function ProjectsList({ featuredRepos, repos }: ProjectsListProps) {
  const t = useTranslations('projectsPage')
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)

  const allRepos = useMemo(() => [...featuredRepos, ...repos], [featuredRepos, repos])
  const languages = useMemo(() => getLanguagesFromRepos(allRepos).slice(0, 8), [allRepos])

  const filteredRepos = useMemo(() => {
    if (!selectedLanguage) return repos
    return repos.filter((repo) => repo.language === selectedLanguage)
  }, [repos, selectedLanguage])

  const filteredFeatured = useMemo(() => {
    if (!selectedLanguage) return featuredRepos
    return featuredRepos.filter((repo) => repo.language === selectedLanguage)
  }, [featuredRepos, selectedLanguage])

  return (
    <>
      {/* Filters */}
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-300">
          {t('filterByLanguage')}
        </h2>
        <LanguageFilter
          languages={languages}
          selected={selectedLanguage}
          onSelect={setSelectedLanguage}
        />
      </section>

      {/* Featured Projects */}
      <AnimatePresence mode="wait">
        {filteredFeatured.length > 0 && (
          <motion.section
            key="featured"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-16"
          >
            <h2 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">
              {t('featuredTitle')}
            </h2>
            <div className="grid gap-6">
              {filteredFeatured.map((repo, index) => (
                <FeaturedProject key={repo.id} repo={repo} index={index} />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* All Projects */}
      <section>
        <h2 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">
          {t('allProjectsTitle')}
        </h2>
        <AnimatePresence mode="wait">
          {filteredRepos.length > 0 ? (
            <motion.div
              key={selectedLanguage || 'all'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredRepos.map((repo, index) => (
                <ProjectCard key={repo.id} repo={repo} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center text-slate-500 dark:text-slate-400"
            >
              {t('noProjectsFound')}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  )
}
