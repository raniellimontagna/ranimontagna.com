import { readFileSync } from 'node:fs'
import { render } from '@/tests/test-utils'
import { ScrollProgress } from '../scroll-progress'

describe('ScrollProgress', () => {
  it('is a decorative 2 px line, fixed at the top, under the header', () => {
    render(<ScrollProgress />)
    const bar = document.querySelector('[data-scroll-progress]') as HTMLElement
    expect(bar).toHaveAttribute('aria-hidden', 'true')
    expect(bar.className).toContain('scroll-progress')
    expect(bar.className).toContain('h-0.5')
    expect(bar.className).toContain('z-30')
  })

  it('is part of the root layout', () => {
    const layout = readFileSync('src/app/[locale]/layout.tsx', 'utf8')
    expect(layout).toContain('<ScrollProgress />')
  })
})
