import { blockStorage } from '@/tests/mocks/storage'
import { loadApproved, PR_COUNT, saveApproved } from '../review'

afterEach(() => {
  localStorage.clear()
})

it('keeps the approved PRs per edition', () => {
  expect(loadApproved(2027)).toBe(0)
  saveApproved(2027, 3)
  expect(loadApproved(2027)).toBe(3)
  expect(loadApproved(2028)).toBe(0)
})

it('reads a corrupt or out-of-range value as a fresh start or the end', () => {
  localStorage.setItem('season-review:programador-2027', 'abc')
  expect(loadApproved(2027)).toBe(0)
  localStorage.setItem('season-review:programador-2027', '2.5')
  expect(loadApproved(2027)).toBe(0)
  localStorage.setItem('season-review:programador-2027', '-4')
  expect(loadApproved(2027)).toBe(0)
  localStorage.setItem('season-review:programador-2027', '99')
  expect(loadApproved(2027)).toBe(PR_COUNT)
})

it('starts over without storage, and saving does not throw', () => {
  blockStorage()
  expect(loadApproved(2027)).toBe(0)
  expect(() => saveApproved(2027, 2)).not.toThrow()
})
