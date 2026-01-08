import { BASE_URL } from '../constants'

describe('constants', () => {
  describe('BASE_URL', () => {
    it('is a valid URL', () => {
      expect(BASE_URL).toMatch(/^https:\/\//)
    })

    it('has no trailing slash', () => {
      expect(BASE_URL.endsWith('/')).toBe(false)
    })

    it('is the correct domain', () => {
      expect(BASE_URL).toBe('https://ranimontagna.com')
    })
  })
})
