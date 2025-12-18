import { render } from '@/tests/functions'
import { ReadingProgressBar } from './reading-progress-bar'

describe('ReadingProgressBar', () => {
  it('should render the progress bar', () => {
    const { container } = render(<ReadingProgressBar />)

    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should have progress bar element', () => {
    const { container } = render(<ReadingProgressBar />)

    const progressBar = container.querySelector('div > div')
    expect(progressBar).toBeInTheDocument()
  })
})
