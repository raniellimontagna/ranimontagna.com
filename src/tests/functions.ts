import { render, renderHook, type RenderOptions } from '@testing-library/react'
import { Wrapper } from './wrapper'

const renderWithProviders = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: Wrapper, ...options })

const renderHookWithProviders = <TResult, TProps>(
  hook: (initialProps: TProps) => TResult,
  options?: RenderOptions,
) => renderHook(hook, { wrapper: Wrapper, ...options })

export {
  act,
  cleanup,
  fireEvent,
  render as rtlRender,
  renderHook as rtlRenderHook,
  screen,
  waitFor,
  within,
  prettyDOM,
} from '@testing-library/react'

export { renderWithProviders as render, renderHookWithProviders as renderHook }
