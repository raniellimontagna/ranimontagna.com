import { REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { captureIntersection, installFrameStub } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { render, screen } from '@/tests/test-utils'
import { RmLogo } from '../rm-logo'
import { RM3D_LAYERS, RmLogo3D } from '../rm-logo-3d'

describe('RmLogo', () => {
  it('draws the two RM paths in currentColor', () => {
    const { container } = render(<RmLogo />)
    const paths = container.querySelectorAll('path')
    expect(paths).toHaveLength(2)
    for (const path of paths) expect(path).toHaveAttribute('fill', 'currentColor')
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('becomes an image with a label when titled', () => {
    render(<RmLogo title="Ranielli Montagna" />)
    expect(screen.getByRole('img', { name: 'Ranielli Montagna' })).toBeInTheDocument()
  })
})

describe('RmLogo3D', () => {
  it('stacks 26 layers behind the face', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    render(<RmLogo3D size={200} label="Ranielli Montagna" />)
    expect(RM3D_LAYERS).toBe(26)
    expect(document.querySelectorAll('[data-rm-layer]')).toHaveLength(26)
    expect(document.querySelectorAll('[data-rm-face]')).toHaveLength(1)
    expect(screen.getByRole('img', { name: 'Ranielli Montagna' })).toBeInTheDocument()
  })

  it('takes layer colors from theme tokens', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    render(<RmLogo3D size={200} label="RM" />)
    for (const layer of document.querySelectorAll<HTMLElement>('[data-rm-layer]')) {
      const style = layer.getAttribute('style') ?? ''
      expect(style).not.toMatch(/#[0-9a-f]{3,8}/i)
      expect(style).toContain('var(--foreground)')
    }
  })

  it('is static without motion', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    const frames = installFrameStub()
    render(<RmLogo3D size={200} label="RM" />)
    frames.flush(3)
    expect(document.querySelector('[data-rm-logo]')).toHaveAttribute('data-motion', 'static')
    expect(document.querySelector('[data-rm-shine]')).toBeNull()
    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('only animates while visible', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    const io = captureIntersection()
    const frames = installFrameStub()
    render(<RmLogo3D size={200} label="RM" />)
    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
    io.setVisible(true)
    expect(window.requestAnimationFrame).toHaveBeenCalled()
    frames.flush(2)
    const rig = document.querySelector('[data-rm-rig]') as HTMLElement
    expect(rig.style.transform).toMatch(/rotateY\(.+deg\) rotateX\(.+deg\)/)
  })
})
