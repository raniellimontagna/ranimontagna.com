import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { FRAGMENT_SHADER } from '../spectral-veil.shaders'

const globalsCss = readFileSync(resolve('src/app/[locale]/globals.css'), 'utf8')

describe('spectral visual contract', () => {
  it('keeps the permanent fallback soft and free from angular conic wedges', () => {
    const fallbackRule = globalsCss.match(/\.spectral-fallback__veil \{([\s\S]*?)\n\}/)?.[1]

    expect(fallbackRule).toBeDefined()
    expect(fallbackRule).not.toContain('conic-gradient')
    expect(fallbackRule?.match(/radial-gradient/g)).toHaveLength(3)
    expect(globalsCss).toContain(
      '.dark .spectral-fallback__veil {\n  mix-blend-mode: screen;\n  opacity: 0.2;',
    )
  })

  it('uses a clearly perceptible but calm autonomous motion rate and veil opacity', () => {
    expect(FRAGMENT_SHADER).toContain('uTime * (0.09 + 0.11 * uMotionScale)')
    expect(FRAGMENT_SHADER).toContain('uIntensity * mix(0.28, 0.46, uDark)')
  })
})
