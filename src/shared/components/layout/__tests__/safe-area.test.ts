import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

describe('fixed surface safe areas', () => {
  it('defines reusable zero-fallback device inset variables', () => {
    const css = readSource('src/app/[locale]/globals.css')

    for (const edge of ['top', 'right', 'bottom', 'left']) {
      expect(css).toContain(`--safe-${edge}: env(safe-area-inset-${edge}, 0px)`)
    }
  })

  it('applies top insets to headers and bottom insets to chat surfaces', () => {
    const headers = [
      readSource('src/features/home/components/home-header.tsx'),
      readSource('src/shared/components/layout/header/header.tsx'),
    ].join('\n')
    const chat = [
      readSource('src/features/home/components/home-client-widgets.tsx'),
      readSource('src/shared/components/ui/chat-widget/chat-widget.tsx'),
    ].join('\n')

    expect(headers).toMatch(/var\(--safe-top\)/)
    expect(headers).toMatch(/var\(--safe-left\)/)
    expect(headers).toMatch(/var\(--safe-right\)/)
    expect(chat).toMatch(/var\(--safe-bottom\)/)
    expect(chat).toMatch(/var\(--safe-right\)/)
  })

  it('does not introduce a viewport-width overflow workaround in headers', () => {
    const headers = [
      readSource('src/features/home/components/home-header.tsx'),
      readSource('src/shared/components/layout/header/header.tsx'),
    ].join('\n')

    expect(headers).not.toContain('100vw')
  })
})
