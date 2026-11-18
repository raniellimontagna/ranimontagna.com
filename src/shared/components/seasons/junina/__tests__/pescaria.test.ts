import { blockStorage } from '@/tests/mocks/storage'
import { loadCaught, saveCaught } from '../pescaria'

afterEach(() => {
  localStorage.clear()
})

it('keeps the catch per edition, in fish order, and drops what is not a fish', () => {
  saveCaught(2027, [3, 1])
  expect(loadCaught(2027)).toEqual([1, 3])
  expect(loadCaught(2028)).toEqual([])
  localStorage.setItem('season-pesca:junina-2027', '[0, 9, "2"]')
  expect(loadCaught(2027)).toEqual([0])
})

it('starts with an empty pond on broken data or blocked storage', () => {
  localStorage.setItem('season-pesca:junina-2027', '{not json')
  expect(loadCaught(2027)).toEqual([])
  localStorage.setItem('season-pesca:junina-2027', '{"0":true}')
  expect(loadCaught(2027)).toEqual([])
  saveCaught(2027, [2])
  blockStorage()
  expect(loadCaught(2027)).toEqual([])
  expect(() => saveCaught(2027, [1])).not.toThrow()
})
