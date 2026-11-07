import { CASES, getCase } from '../cases.data'

describe('cases data', () => {
  it('getCase returns null for unknown slugs', () => {
    expect(getCase('xyz')).toBeNull()
    expect(getCase('klick')?.slug).toBe('klick')
  })

  it('links each case to the other one', () => {
    expect(CASES.klick.next).toBe('grimory')
    expect(CASES.grimory.next).toBe('klick')
  })

  it('only uses real captures that ship with the site', () => {
    for (const study of Object.values(CASES)) {
      for (const image of [study.hero, ...study.gallery]) {
        expect(image.src).toMatch(/^\/redesign\/products\/.+\.webp$/)
      }
    }
  })
})
