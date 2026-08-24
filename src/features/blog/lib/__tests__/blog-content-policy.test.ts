import {
  remarkBlogContentPolicy,
  validateBlogFrontmatter,
  validateBlogMarkdown,
} from '../blog-content-policy'

describe('blog content policy', () => {
  const validFrontmatter = {
    title: 'A valid post',
    date: '2026-08-23',
    description: 'A useful description.',
    tags: ['react', 'security'],
    published: true,
    coverImage: 'https://images.unsplash.com/photo-1',
  }

  it('accepts strict, safe frontmatter', () => {
    expect(validateBlogFrontmatter(validFrontmatter, '2026-08-22')).toEqual(validFrontmatter)
  })

  it('preserves the safe empty-list default for legacy frontmatter without tags', () => {
    const { tags: _tags, ...legacyFrontmatter } = validFrontmatter

    expect(validateBlogFrontmatter(legacyFrontmatter, '2026-08-22')).toMatchObject({
      tags: [],
      published: true,
    })
  })

  it('fails closed when published is missing', () => {
    const { published: _published, ...frontmatterWithoutPublicationState } = validFrontmatter

    expect(() =>
      validateBlogFrontmatter(frontmatterWithoutPublicationState, '2026-08-22'),
    ).toThrow('Invalid blog frontmatter')
  })

  it('normalizes the exact UTC Date produced by the YAML parser', () => {
    expect(
      validateBlogFrontmatter(
        { ...validFrontmatter, date: new Date('2026-08-23T00:00:00.000Z') },
        '2026-08-22',
      ).date,
    ).toBe('2026-08-23')
  })

  it.each([
    [{ ...validFrontmatter, title: '' }],
    [{ ...validFrontmatter, date: '2026-02-30' }],
    [{ ...validFrontmatter, tags: ['ok', 42] }],
    [{ ...validFrontmatter, published: 'yes' }],
    [{ ...validFrontmatter, coverImage: 'javascript:alert(1)' }],
    [{ ...validFrontmatter, coverImage: 'data:image/svg+xml,unsafe' }],
    [{ ...validFrontmatter, unexpected: true }],
  ])('rejects malformed frontmatter %#', (frontmatter) => {
    expect(() => validateBlogFrontmatter(frontmatter, '2026-08-22')).toThrow(
      'Invalid blog frontmatter',
    )
  })

  it.each([
    '<script>marker()</script>',
    '<img src="x" onerror="marker()">',
    '<UndefinedComponent />',
    '{marker()}',
    'import Widget from "./widget"',
    'export const marker = true',
    '[unsafe][marker]\n\n[marker]: javascript:marker()',
    '![unsafe][marker]\n\n[marker]: java&#x73;cript:marker()',
    '<>fragment</>',
    '<Componént />',
    '<Unclosed',
  ])('rejects executable MDX syntax: %s', async (markdown) => {
    await expect(validateBlogMarkdown(markdown)).rejects.toThrow('Unsafe blog content')
  })

  it('allows ordinary Markdown, GFM, autolinks, images and Mermaid fences', async () => {
    const markdown = `# Safe post

| Feature | Ready |
| --- | --- |
| GFM | yes |

Visit https://example.com and see ![diagram](/images/diagram.webp).

\`\`\`mermaid
flowchart LR
  A --> B
\`\`\`
`

    await expect(validateBlogMarkdown(markdown)).resolves.toBeUndefined()
  })

  it('treats executable-looking text inside fenced code as inert data', async () => {
    await expect(
      validateBlogMarkdown('```tsx\n<script>example</script>\nexport const demo = true\n```'),
    ).resolves.toBeUndefined()
  })

  it('rejects prohibited nodes at the Remark AST compiler boundary', () => {
    const transform = remarkBlogContentPolicy()

    expect(() =>
      transform({ type: 'root', children: [{ type: 'mdxJsxFlowElement' }] }),
    ).toThrow('Unsafe blog content')
    expect(() =>
      transform({ type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text' }] }] }),
    ).not.toThrow()
  })

  it.each([
    { type: 'link', url: 'javascript:marker()' },
    { type: 'image', url: 'data:image/svg+xml,unsafe' },
    { type: 'definition', url: 'javascript:marker()' },
  ])('rejects an unsafe $type URL at the AST boundary', (node) => {
    const transform = remarkBlogContentPolicy()
    expect(() => transform({ type: 'root', children: [node] })).toThrow('Unsafe blog content')
  })
})
