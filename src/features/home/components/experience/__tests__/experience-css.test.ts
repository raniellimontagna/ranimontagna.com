import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { useTranslations } from 'next-intl'
import { experiences } from '../experience.static'

const css = readFileSync(resolve('src/features/home/components/experience/experience.css'), 'utf8')
const t = Object.assign((key: string) => key, { raw: () => [] }) as unknown as ReturnType<
  typeof useTranslations
>

describe('experience.css', () => {
  it('has a mobile carousel rule for every experience', () => {
    const count = experiences(t).length

    for (let index = 0; index < count; index++) {
      expect(css).toContain(
        `:has([data-experience-mobile-input="${index}"]:checked) [data-experience-mobile-slide="true"][data-experience-index="${index}"]`,
      )
      expect(css).toContain(
        `:has([data-experience-mobile-input="${index}"]:checked) [data-experience-mobile-dot="true"][data-experience-index="${index}"]`,
      )
      expect(css).toContain(
        `:has([data-experience-mobile-input="${index}"]:checked) [data-experience-mobile-arrow][data-experience-index="${index}"]`,
      )
    }
  })
})
