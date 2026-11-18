import { installFakeAudio } from '@/tests/mocks/audio'
import { setSeasonSound } from '../../shared/season-sound'
import { playAuldLangSyne, playPop, playSplash } from '../reveillon-sound'

afterEach(() => {
  setSeasonSound(false)
  vi.restoreAllMocks()
})

it('plays the pop, the splash and the song only with the season sound on', () => {
  const { oscillators } = installFakeAudio()
  playPop()
  playSplash()
  playAuldLangSyne()
  expect(oscillators).not.toHaveBeenCalled()

  setSeasonSound(true)
  playPop()
  expect(oscillators).toHaveBeenCalledTimes(4)
  playSplash()
  expect(oscillators).toHaveBeenCalledTimes(7)
  const stop = playAuldLangSyne()
  expect(oscillators).toHaveBeenCalledTimes(21)
  expect(() => stop()).not.toThrow()
})
