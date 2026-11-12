import { existsSync } from 'node:fs'
import { join } from 'node:path'
import en from '../../../../messages/en.json'
import es from '../../../../messages/es.json'
import pt from '../../../../messages/pt.json'
import { CASES, type CaseMedia, caseHost, getCase } from '../cases.data'

const LOCALES = { pt, en, es } as const
const fileFor = (src: string) => join(process.cwd(), 'public', src)

function allMedia(): CaseMedia[] {
  return Object.values(CASES).flatMap((study) =>
    [study.hero, ...study.tour.map((step) => step.screens)].flatMap(({ desk, phone }) => [
      desk,
      phone,
    ]),
  )
}

describe('cases data', () => {
  it('getCase returns null for unknown slugs', () => {
    expect(getCase('xyz')).toBeNull()
    expect(getCase('klick')?.slug).toBe('klick')
  })

  it('links each case to the other one', () => {
    expect(CASES.klick.next).toBe('grimory')
    expect(CASES.grimory.next).toBe('klick')
  })

  it('serves every screen and loop from the versioned cases folder, and each file ships', () => {
    for (const media of allMedia()) {
      expect(media.src).toMatch(/^\/redesign\/cases\/v1\/.+\.webp$/)
      expect(existsSync(fileFor(media.src))).toBe(true)
      if (media.video) {
        expect(media.video).toMatch(/^\/redesign\/cases\/v1\/.+\.mp4$/)
        expect(existsSync(fileFor(media.video))).toBe(true)
        // The poster is the loop's first frame, so nothing jumps when it starts.
        expect(media.src).toBe(media.video.replace(/\.mp4$/, '.webp'))
      }
    }
  })

  it('ships a share card per case', () => {
    for (const study of Object.values(CASES)) {
      expect(study.shareImage).toMatch(/^\/redesign\/cases\/v1\/.+\.jpg$/)
      expect(existsSync(fileFor(study.shareImage))).toBe(true)
    }
  })

  it('gives each case a tour of three distinct steps', () => {
    for (const study of Object.values(CASES)) {
      const ids = study.tour.map((step) => step.id)
      expect(ids).toHaveLength(3)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('has the tour copy and both alts for every step in every language', () => {
    for (const [locale, messages] of Object.entries(LOCALES)) {
      for (const study of Object.values(CASES)) {
        const copy = messages.cases[study.slug] as {
          heroAlt: string
          heroPhoneAlt: string
          tour: Record<string, Record<string, string>>
        }
        expect(copy.heroAlt, `${locale} ${study.slug} heroAlt`).toBeTruthy()
        expect(copy.heroPhoneAlt, `${locale} ${study.slug} heroPhoneAlt`).toBeTruthy()
        for (const step of study.tour) {
          for (const key of ['title', 'body', 'deskAlt', 'phoneAlt']) {
            expect(
              copy.tour[step.id]?.[key],
              `${locale} ${study.slug} ${step.id}.${key}`,
            ).toBeTruthy()
          }
        }
      }
    }
  })

  it('counts the agent-assisted commits it quotes', () => {
    for (const study of Object.values(CASES)) {
      expect(study.commits.agent).toBeGreaterThan(0)
      expect(study.commits.agent).toBeLessThanOrEqual(study.commits.total)
    }
  })

  it('names the host shown in the browser frame after the live address', () => {
    expect(caseHost(CASES.klick)).toBe('klick.ranimontagna.com')
    expect(caseHost(CASES.grimory)).toBe('grimory.com.br')
  })
})
