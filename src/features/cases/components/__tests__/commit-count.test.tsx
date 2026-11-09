import { render, screen } from '@testing-library/react'
import { CommitCount } from '../commit-count'

describe('CommitCount', () => {
  it('writes both numbers in the locale’s format, the final ones before any script', () => {
    const { container } = render(
      <CommitCount agent={2328} total={2495} locale="pt" label="commits com agente" />,
    )
    expect(container.querySelector('[data-commit-count]')?.textContent).toBe('2.328')
    expect(container.textContent).toContain('/2.495')
  })

  it('reads as one sentence to assistive tech, not as a ticking number', () => {
    render(
      <CommitCount agent={428} total={429} locale="en" label="commits co-authored by an agent" />,
    )
    expect(screen.getByText('428 / 429 commits co-authored by an agent')).toHaveClass('sr-only')
    expect(
      document.querySelector('[data-commit-count]')?.closest('[aria-hidden="true"]'),
    ).not.toBeNull()
  })
})
