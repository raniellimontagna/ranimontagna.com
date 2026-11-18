import { blockStorage } from '@/tests/mocks/storage'
import { addFound, HUNT_SPOTS, huntKey, isComplete, loadFound, saveFound } from '../hunt'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

it('hides the gifts only in sections that always render (the blog section can step aside)', () => {
  expect(HUNT_SPOTS).toEqual(['ia', 'no-ar', 'trajetoria', 'atto', 'contato'])
})

it('keeps one entry per gift, in page order', () => {
  expect(addFound(['atto'], 'ia')).toEqual(['ia', 'atto'])
  expect(addFound(['ia'], 'ia')).toEqual(['ia'])
})

it('is complete only with all five', () => {
  expect(isComplete(['ia', 'no-ar', 'trajetoria', 'atto'])).toBe(false)
  expect(isComplete(['ia', 'no-ar', 'trajetoria', 'atto', 'contato'])).toBe(true)
})

it('remembers what was found per season and edition, under the Christmas key of 2026', () => {
  saveFound('natal', 2026, ['ia', 'atto'])
  expect(localStorage.getItem('season-gifts:natal-2026')).toBe('["ia","atto"]')
  expect(loadFound('natal', 2026)).toEqual(['ia', 'atto'])
  expect(loadFound('natal', 2027)).toEqual([])
})

it('starts over on broken or foreign data', () => {
  localStorage.setItem(huntKey('natal', 2026), '{not json')
  expect(loadFound('natal', 2026)).toEqual([])
  localStorage.setItem(huntKey('natal', 2026), '["ia","bogus"]')
  expect(loadFound('natal', 2026)).toEqual(['ia'])
})

it('starts over when storage is blocked', () => {
  saveFound('natal', 2026, ['ia'])
  blockStorage()
  expect(loadFound('natal', 2026)).toEqual([])
  expect(() => saveFound('natal', 2026, ['atto'])).not.toThrow()
})

it('keeps each season apart', () => {
  saveFound('natal', 2026, ['ia'])
  expect(loadFound('reveillon', 2026)).toEqual([])
})
