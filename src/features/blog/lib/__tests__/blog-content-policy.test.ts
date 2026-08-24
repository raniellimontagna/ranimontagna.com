import {
  assertSafeBlogMarkdown,
  remarkBlogContentPolicy,
  validateBlogFrontmatter,
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

  it('preserves safe defaults for legacy frontmatter without tags or published', () => {
    const { tags: _tags, published: _published, ...legacyFrontmatter } = validFrontmatter

    expect(validateBlogFrontmatter(legacyFrontmatter, '2026-08-22')).toMatchObject({
      tags: [],
      published: true,
    })
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
  ])('rejects executable MDX syntax: %s', (markdown) => {
    expect(() => assertSafeBlogMarkdown(markdown)).toThrow('Unsafe blog content')
  })

  it('allows ordinary Markdown, GFM, autolinks, images and Mermaid fences', () => {
    const markdown = `# Safe post

| Feature | Ready |
| --- | --- |
| GFM | yes |

Visit <https://example.com> and see ![diagram](/images/diagram.webp).

\`\`\`mermaid
flowchart LR
  A --> B
\`\`\`
`

    expect(() => assertSafeBlogMarkdown(markdown)).not.toThrow()
  })

  it('treats executable-looking text inside fenced code as inert data', () => {
    expect(() =>
      assertSafeBlogMarkdown('```tsx\n<script>example</script>\nexport const demo = true\n```'),
    ).not.toThrow()
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
})
