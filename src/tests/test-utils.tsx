import type { RenderOptions, RenderResult } from '@testing-library/react'
import { render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'

function AllProviders({ children }: { children: ReactNode }) {
  return <>{children}</>
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>): RenderResult {
  return render(ui, { wrapper: AllProviders, ...options })
}

export function resetZustandStore<T>(
  useStore: { getState: () => T; setState: (state: Partial<T>) => void },
  initialState: Partial<T>,
) {
  useStore.setState(initialState)
}

export function createFetchMock(response: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
    type: 'basic',
  })
}

export * from '@testing-library/react'
export { customRender as render }
