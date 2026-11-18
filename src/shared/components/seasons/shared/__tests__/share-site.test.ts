import { shareSite } from '../share-site'

afterEach(() => {
  Reflect.deleteProperty(navigator, 'share')
  Reflect.deleteProperty(navigator, 'clipboard')
})

const card = { title: 'Feliz 2027', text: 'Pulei as 7 ondas.' }

it('uses the share sheet with the home page in the visitor language', async () => {
  const share = vi.fn(() => Promise.resolve())
  Object.defineProperty(navigator, 'share', { configurable: true, value: share })
  await expect(shareSite({ locale: 'en', ...card })).resolves.toBe('shared')
  expect(share).toHaveBeenCalledWith({ ...card, url: `${window.location.origin}/en` })
})

it('treats a cancelled share sheet as not shared', async () => {
  Object.defineProperty(navigator, 'share', {
    configurable: true,
    value: () => Promise.reject(new Error('AbortError')),
  })
  await expect(shareSite({ locale: 'pt', ...card })).resolves.toBe('failed')
})

it('copies the link when there is no share sheet', async () => {
  const writeText = vi.fn(() => Promise.resolve())
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  await expect(shareSite({ locale: 'pt', ...card })).resolves.toBe('copied')
  expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/`)
})

it('fails quietly without a clipboard', async () => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: () => Promise.reject(new Error('denied')) },
  })
  await expect(shareSite({ locale: 'es', ...card })).resolves.toBe('failed')
})
