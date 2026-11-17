import { getLocale, getTranslations } from 'next-intl/server'
import { getResumeByLocale, socialLinks } from '@/shared/lib/social-links'
import {
  ActionLink,
  PhotoReveal,
  Reveal,
  RmLogo3D,
  ScrubText,
  SECTION_X,
  WordReveal,
} from '@/shared/ui-2026'
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
      {/* The old #contact anchor lands here. */}
      <span id="contact" aria-hidden="true" />
      <div
        className={`${SECTION_X} grid gap-14 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.55fr)] lg:items-center lg:gap-16`}
      >
        <Reveal className="flex flex-col gap-8">
          <p data-reveal className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
            {t('kicker')}
            {/* Empty outside a season; Christmas hides a gift here (no extra flex gap). */}
            <span data-season-gift="contato" className="relative block h-0" />
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
            <ActionLink href={resume.href} variant="quiet" download>
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
        {/* A coffee and a conversation: the photo that goes with "call me". */}
        <PhotoReveal
          master="/images/ranielli-cafe.webp"
          alt={t('photoAlt')}
          effect="scale"
          sizes="(max-width: 1023px) 100vw, 30vw"
          className="aspect-[4/5] w-full max-w-xl rounded-[2px] lg:max-w-none"
        />
      </div>

      <div className="mt-20 flex justify-center sm:mt-28">
        <RmLogo3D size={180} label="Ranielli Montagna" />
      </div>

      <Reveal stagger={0.035} className="mt-10 sm:mt-14">
        {/* Below lg the letters climb with the scroll instead of once. */}
        <ScrubText effect="rise">
          <p className="px-2 pb-[0.06em] text-center text-[21vw] leading-[0.9] font-semibold tracking-[-0.06em] text-foreground sm:text-[clamp(56px,13.5vw,240px)] sm:whitespace-nowrap">
            <span className="sr-only">{NAME}</span>
            {NAME.split(' ').map((word, wordIndex) => (
              <span
                key={word}
                data-name-word
                className="inline-block whitespace-nowrap max-lg:-mb-[0.12em] max-lg:overflow-hidden max-lg:pb-[0.12em]"
              >
                {wordIndex > 0 ? <span aria-hidden="true"> </span> : null}
                {Array.from(word, (letter, index) => (
                  <span key={index} data-reveal-word aria-hidden="true" className="inline-block">
                    {letter}
                  </span>
                ))}
              </span>
            ))}
          </p>
        </ScrubText>
      </Reveal>
    </section>
  )
}
