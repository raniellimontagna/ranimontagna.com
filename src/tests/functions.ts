import { type RenderOptions, render } from '@testing-library/react'
import { Wrapper } from './wrapper'

const renderWithProviders = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: Wrapper, ...options })

export { fireEvent, screen, waitFor } from '@testing-library/react'

export { renderWithProviders as render }
