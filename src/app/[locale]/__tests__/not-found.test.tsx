import { render, screen } from '@/tests/test-utils'
import NotFoundPage from '../not-found'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

it('keeps the visitor in their language on the way out of a 404', () => {
  render(<NotFoundPage />)
  expect(screen.getByRole('link', { name: 'backHome' })).toHaveAttribute('href', '/en')
  expect(screen.getByRole('link', { name: 'links.blog.title' })).toHaveAttribute('href', '/en/blog')
})
