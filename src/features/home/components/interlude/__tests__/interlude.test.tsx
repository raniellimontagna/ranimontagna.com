import { REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { render, screen } from '@/tests/test-utils'
import { Interlude } from '../interlude'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

describe('Interlude', () => {
  it('renders the statement as text and the photo with alt, visible without motion', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(await Interlude())
    expect(screen.getByLabelText('statement')).toBeInTheDocument()
    expect(screen.getByText('detail')).toBeInTheDocument()
    const img = screen.getByAltText('photoAlt') as HTMLImageElement
    expect(img.style.opacity).not.toBe('0')
  })
})
