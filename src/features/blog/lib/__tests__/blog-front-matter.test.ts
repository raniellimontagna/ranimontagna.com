import { parseFrontMatter } from '../blog-front-matter'

const probe = globalThis as { __frontMatterProbe?: number }

describe('parseFrontMatter', () => {
  afterEach(() => {
    delete probe.__frontMatterProbe
  })

  it('parses YAML front matter', () => {
    const { data, content } = parseFrontMatter('---\ntitle: Olá\ntags: [a, b]\n---\nCorpo')

    expect(data).toEqual({ title: 'Olá', tags: ['a', 'b'] })
    expect(content.trim()).toBe('Corpo')
  })

  it.each(['js', 'javascript'])('rejects ---%s front matter without evaluating it', (fence) => {
    const input = `---${fence}\n{ title: (globalThis.__frontMatterProbe = 1, 'x') }\n---\nCorpo`

    expect(() => parseFrontMatter(input)).toThrow('YAML')
    expect(probe.__frontMatterProbe).toBeUndefined()
  })
})
