import { getTranslations } from 'next-intl/server'
import { BrandIcon, Reveal, SECTION_X, SectionHeading } from '@/shared/ui-2026'
import { AI_MODELS, AI_PROOF_IDS, AI_STEP_IDS, AI_TERM_IDS } from './ai-method.data'
import { AiMethodSteps } from './ai-method-steps'
import { ModelDeal } from './ai-model-deal'

/** No lock-in to one model, and a method that keeps a human in charge. */
export async function AiMethod() {
  const t = await getTranslations('aiMethod')
  const steps = AI_STEP_IDS.map((id) => ({
    id,
    title: t(`steps.${id}.title`),
    lines: t.raw(`steps.${id}.lines`) as string[],
  }))

  return (
    <section id="ia" className={`${SECTION_X} bg-background py-24 sm:py-32`}>
      {/* The previous site's #skills anchor lands here. */}
      <span id="skills" aria-hidden="true" />
      <Reveal>
        <SectionHeading id="ia" kicker={t('kicker')} title={t('title')} lead={t('lead')} />
      </Reveal>

      <div className="mt-16 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">
            {t('free.title')}
          </h3>
          <p className="text-sm leading-snug text-muted">{t('free.body')}</p>
        </div>
        <ModelDeal>
          <ul
            data-ai-models
            aria-label={t('modelsLabel')}
            className="grid grid-cols-3 border-t border-l border-line"
          >
            {AI_MODELS.map((model) => (
              <li
                key={model.name}
                className="group/model flex flex-col items-center gap-2 border-r border-b border-line px-2 py-5 sm:gap-3 sm:px-5 sm:py-8"
              >
                <BrandIcon
                  name={model.icon}
                  className="h-8 w-8 text-foreground transition-[color,transform] sm:h-11 sm:w-11 duration-300 group-hover/model:-translate-y-[3px] group-hover/model:text-accent"
                />
                <span data-ai-model className="text-sm font-semibold text-foreground sm:text-base">
                  {model.name}
                </span>
              </li>
            ))}
          </ul>
        </ModelDeal>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">
            {t('method.title')}
          </h3>
          <p className="text-sm leading-snug text-muted">{t('method.body')}</p>
        </div>
        {/* min-w-0: a grid item grows to its content's min-content, and the
            step carousel's content is six cards wide. */}
        <div className="flex min-w-0 flex-col gap-5">
          <AiMethodSteps steps={steps} label={t('stepsLabel')} />
          <ul className="flex flex-wrap gap-2">
            {AI_TERM_IDS.map((id) => (
              <li
                key={id}
                data-ai-term={id}
                className="rounded-full border border-line px-3.5 py-1.5 text-sm text-foreground"
              >
                <span className="mr-1.5 font-mono text-xs font-semibold text-accent">
                  {t(`terms.${id}.term`)}
                </span>
                {t(`terms.${id}.meaning`)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <dl className="mt-16 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {AI_PROOF_IDS.map((id) => (
          <div
            key={id}
            data-ai-proof={id}
            className="flex flex-col gap-2 border-t border-line pt-4"
          >
            <dt className="text-3xl font-semibold tracking-tight text-foreground">
              {t(`proofs.${id}.value`)}
            </dt>
            <dd className="text-sm leading-snug text-muted">{t(`proofs.${id}.label`)}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
