import { getLocale, getTranslations } from 'next-intl/server'
import { getResumeByLocale, socialLinks } from '@/shared/lib/social-links'
import { ActionLink, Reveal, SECTION_X, WordReveal } from '@/shared/ui-2026'
import { attoWhatsappHref } from '../atto/atto.data'
import { CopyEmailButton } from './copy-email-button'

const NAME = 'Ranielli Montagna'
const SOCIALS = [
  socialLinks.linkedin,
  socialLinks.instagram,
  socialLinks.twitter,
  socialLinks.github,
]

export async function Closing() {
  const [t, locale] = await Promise.all([getTranslations('closing'), getLocale()])
  const resume = getResumeByLocale(locale as 'pt' | 'en' | 'es')

  return (
    <section id="contato" className="overflow-hidden bg-background pt-24 sm:pt-32">
      <Reveal className={`${SECTION_X} flex flex-col gap-8`}>
        <p data-reveal className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
          {t('kicker')}
        </p>
        <WordReveal
          text={t('title')}
          className="max-w-4xl text-[clamp(40px,6vw,104px)] leading-[0.95] font-semibold tracking-[-0.04em] text-foreground"
        />
        <p data-reveal className="max-w-2xl text-lg leading-snug text-foreground sm:text-xl">
          {t('lead')}
        </p>
        <div data-reveal className="flex flex-col flex-wrap gap-4 sm:flex-row sm:items-center">
          <ActionLink href={attoWhatsappHref(t('whatsappMessage'))} external>
            {t('ctaAtto')}
          </ActionLink>
          <CopyEmailButton
            email="contato@ranimontagna.com"
            label={t('copyEmail')}
            copied={t('copied')}
          />
          <ActionLink href={resume.href} variant="quiet">
            {t('resume')} ({resume.language})
          </ActionLink>
        </div>
        <ul data-reveal className="mt-6 flex flex-wrap gap-3" aria-label={t('socialsLabel')}>
          {SOCIALS.map((social) => {
            const Icon = social.icon
            return (
              <li key={social.name}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel}
                  className="flex h-12 items-center gap-3 rounded-full border border-line px-5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {social.name}
                </a>
              </li>
            )
          })}
        </ul>
      </Reveal>

      <Reveal stagger={0.035} className="mt-20 sm:mt-28">
        <p
          aria-label={NAME}
          className="px-2 text-center text-[clamp(56px,13.5vw,240px)] leading-[0.82] font-semibold tracking-[-0.06em] whitespace-nowrap text-foreground"
        >
          {Array.from(NAME, (letter, index) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: letters repeat; position is the identity.
              key={index}
              data-reveal-word
              aria-hidden="true"
              className="inline-block"
            >
              {letter === ' ' ? ' ' : letter}
            </span>
          ))}
        </p>
      </Reveal>
    </section>
  )
}
