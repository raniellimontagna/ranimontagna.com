import React from 'react'
import { vi } from 'vitest'
import mockRouter from 'next-router-mock'

vi.mock('next/image', () => {
  return {
    __esModule: true,
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
      React.createElement('img', { ...props }),
  }
})

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof import('next/navigation')>('next/navigation')
  return {
    ...actual,
    useRouter: () => mockRouter,
    usePathname: () => mockRouter.asPath,
    useSearchParams: () => new URLSearchParams(),
    useLocale: () => 'pt-BR',
  }
})

class IntersectionObserverMock {
  constructor(private callback: IntersectionObserverCallback) {}
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn().mockReturnValue([])
}

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
})
