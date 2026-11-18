import { blockStorage } from '@/tests/mocks/storage'
import { loadBloco, pickBloco, saveBloco } from '../bloco'

afterEach(() => {
  localStorage.clear()
})

it('never draws the name already on the banner', () => {
  for (let previous = 0; previous < 24; previous++) {
    for (const r of [0, 0.3, 0.5, 0.99]) {
      expect(pickBloco(24, previous, () => r)).not.toBe(previous)
    }
  }
  expect(pickBloco(24, null, () => 0.5)).toBe(12)
})

it('keeps the name for the edition, and starts fresh in the next', () => {
  expect(loadBloco(2027, 24)).toBeNull()
  saveBloco(2027, 5)
  expect(loadBloco(2027, 24)).toBe(5)
  expect(loadBloco(2028, 24)).toBeNull()
  localStorage.setItem('season-bloco:carnaval-2027', '99')
  expect(loadBloco(2027, 24)).toBeNull()
})

it('starts with no name when storage is blocked, and drawing still works', () => {
  saveBloco(2027, 5)
  blockStorage()
  expect(() => localStorage.getItem('any')).toThrow('blocked')
  expect(loadBloco(2027, 24)).toBeNull()
  expect(() => saveBloco(2027, 6)).not.toThrow()
})
