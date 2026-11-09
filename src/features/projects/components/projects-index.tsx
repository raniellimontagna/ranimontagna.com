import { getTranslations } from 'next-intl/server'
import { CASE_SLUGS, CASES } from '@/features/cases/cases.data'
import { CaseCover } from '@/features/cases/components/case-cover'
import { attoWhatsappHref } from '@/features/home/components/atto/atto.data'
import type { GitHubProjectSnapshot } from '@/features/projects/types/github.types'
import { Link } from '@/shared/config/i18n/navigation'
import { ActionLink, Reveal, SECTION_X, WordReveal } from '@/shared/ui-2026'
import { RepoList } from './repo-list'

type ProjectsIndexProps = { snapshot: GitHubProjectSnapshot; locale: string }

export async function ProjectsIndex({ snapshot, locale }: ProjectsIndexProps) {
  const [t, tCases] = await Promise.all([
    getTranslations('projectsIndex'),
    getTranslations('cases'),
  ])
  const stats = [
    { value: snapshot.stats.public_repos, label: t('stats.repos') },
    { value: snapshot.stats.total_stars, label: t('stats.stars') },
    { value: snapshot.stats.followers, label: t('stats.followers') },
  ]

  return (
    <div className="pb-24 sm:pb-32">
      <Reveal className={`${SECTION_X} flex flex-col gap-6 pt-20 sm:pt-28`}>
        <p data-reveal className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
          {t('kicker')}
        </p>
        <WordReveal
          as="h1"
          text={t('title')}
          className="max-w-5xl text-[clamp(48px,8vw,140px)] leading-[0.9] font-semibold tracking-[-0.05em] text-foreground"
        />
        <p data-reveal className="max-w-2xl text-lg leading-snug text-foreground sm:text-xl">
          {t('lead')}
        </p>
      </Reveal>

      <section aria-labelledby="cases-title" className={`${SECTION_X} mt-16 sm:mt-24`}>
        <h2
          id="cases-title"
          className="mb-8 font-mono text-xs tracking-[0.2em] text-muted uppercase"
        >
          {t('casesTitle')}
        </h2>
        <ul className="grid gap-10 lg:grid-cols-2">
          {CASE_SLUGS.map((slug, index) => (
            <li key={slug}>
              <Link href={`/projects/${slug}`} className="group block">
                <div className="transition-transform duration-700 group-hover:-translate-y-1.5 motion-reduce:transition-none">
                  <CaseCover
                    study={CASES[slug]}
                    // The first case is the page's LCP on phones: no lazy loading there.
                    priority={index === 0}
                  />
                </div>
                <span className="mt-5 block text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {tCases(`${slug}.name`)}
                </span>
                <span className="mt-1 block text-base text-foreground">
                  {tCases(`${slug}.tagline`)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="github-title" className={`${SECTION_X} mt-24 sm:mt-32`}>
        <div className="mb-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <h2
            id="github-title"
            className="text-[clamp(36px,4.6vw,72px)] leading-[0.98] font-semibold tracking-[-0.035em] text-foreground"
          >
            {t('githubTitle')}
          </h2>
          <dl className="flex gap-10">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="font-mono text-xs text-muted">{stat.label}</dt>
                <dd className="text-4xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <RepoList
          repos={snapshot.repos}
          languages={snapshot.languages}
          locale={locale}
          labels={{
            all: t('repos.all'),
            empty: t('repos.empty'),
            stars: t('repos.stars'),
            updated: t('repos.updated'),
            site: t('repos.site'),
            filterLabel: t('repos.label'),
          }}
        />
      </section>

      <section
        className={`${SECTION_X} mt-24 flex flex-col gap-6 border-t border-line pt-16 sm:mt-32`}
      >
        <p className="max-w-3xl text-[clamp(28px,3.4vw,52px)] leading-[1.02] font-semibold tracking-[-0.03em] text-foreground">
          {t('atto')}
        </p>
        <ActionLink href={attoWhatsappHref(t('whatsappMessage'))} external className="self-start">
          {t('attoCta')}
        </ActionLink>
      </section>
    </div>
  )
}
