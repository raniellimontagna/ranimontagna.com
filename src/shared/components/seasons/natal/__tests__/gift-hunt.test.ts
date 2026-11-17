import { addFound, giftsKey, isComplete, loadFound, saveFound } from '../gift-hunt'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

it('keeps one entry per gift, in page order', () => {
  expect(addFound(['atto'], 'ia')).toEqual(['ia', 'atto'])
  expect(addFound(['ia'], 'ia')).toEqual(['ia'])
})

it('is complete only with all five', () => {
  expect(isComplete(['ia', 'no-ar', 'trajetoria', 'atto'])).toBe(false)
  expect(isComplete(['ia', 'no-ar', 'trajetoria', 'atto', 'escrita'])).toBe(true)
})

it('remembers the gifts found this year', () => {
  saveFound(2026, ['ia', 'atto'])
  expect(localStorage.getItem(giftsKey(2026))).toBe('["ia","atto"]')
  expect(loadFound(2026)).toEqual(['ia', 'atto'])
  expect(loadFound(2027)).toEqual([])
})

it('starts over on broken or foreign data', () => {
  localStorage.setItem(giftsKey(2026), '{not json')
  expect(loadFound(2026)).toEqual([])
  localStorage.setItem(giftsKey(2026), '["ia","bogus"]')
  expect(loadFound(2026)).toEqual(['ia'])
})

it('starts over when storage is blocked', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  expect(loadFound(2026)).toEqual([])
  expect(() => saveFound(2026, ['ia'])).not.toThrow()
})
