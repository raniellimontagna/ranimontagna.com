import { getAllPosts } from '@/features/blog/lib/blog'
import { isAllowedCardHref, sanitizeCards } from '@/shared/vega/vega-card'
import { buildCardCatalog, pickCards } from '../chat.cards'
import { buildTextStream } from '../chat.response'

vi.mock('@/features/blog/lib/blog', () => ({
  getAllPosts: vi.fn(async () => [
    {
      slug: 'como-uso-ia',
      metadata: {
        title: 'Como uso IA no dia a dia',
        description: 'Um post',
        date: '2026-10-01',
        tags: [],
        published: true,
      },
    },
  ]),
}))

async function readStream(stream: ReadableStream<Uint8Array>) {
  return await new Response(stream).text()
}

describe('chat cards', () => {
  it('picks the Grimory case when the answer mentions it', async () => {
    const catalog = await buildCardCatalog('pt')
    expect(pickCards('O Grimory é o melhor exemplo.', catalog).map((c) => c.id)).toEqual([
      'case-grimory',
    ])
  })

  it('keeps first-mention order and caps at two', async () => {
    const catalog = await buildCardCatalog('pt')
    const cards = pickCards('Fale com a Atto. Ele fez o Klick e o Grimory.', catalog)
    expect(cards.map((c) => c.id)).toEqual(['section-atto', 'case-klick'])
  })

  it('ignores partial words', async () => {
    const catalog = await buildCardCatalog('pt')
    expect(pickCards('Isso é Klickbait, disse o attorney.', catalog)).toEqual([])
  })

  it('returns nothing for unrelated answers', async () => {
    const catalog = await buildCardCatalog('pt')
    expect(pickCards('Ele mora no Rio Grande do Sul.', catalog)).toEqual([])
  })

  it('includes published posts by title', async () => {
    const catalog = await buildCardCatalog('pt')
    const [card] = pickCards('Leia "Como uso IA no dia a dia" no blog.', catalog)
    expect(card).toMatchObject({ id: 'post:como-uso-ia', kind: 'post', href: '/blog/como-uso-ia' })
  })

  it('uses locale-less hrefs that the client prefixes', async () => {
    const catalog = await buildCardCatalog('en')
    const [card] = pickCards('Grimory is the best example.', catalog)
    expect(card.href).toBe('/projects/grimory')
    expect(card.title).toBe('Grimory')
  })

  it('rejects external or protocol-relative hrefs', () => {
    expect(isAllowedCardHref('/projects/klick')).toBe(true)
    expect(isAllowedCardHref('/#trajetoria')).toBe(true)
    expect(isAllowedCardHref('/blog/como-uso-ia')).toBe(true)
    expect(isAllowedCardHref('//evil.com')).toBe(false)
    expect(isAllowedCardHref('https://x.com')).toBe(false)
    expect(isAllowedCardHref('/#evil')).toBe(false)
    expect(isAllowedCardHref('javascript:alert(1)')).toBe(false)
  })

  it('buildTextStream emits text, cards, done in order', async () => {
    const catalog = await buildCardCatalog('pt')
    const cards = pickCards('O Grimory.', catalog)
    const body = await readStream(buildTextStream('O Grimory.', cards))
    const events = body.split('\n\n').filter(Boolean)
    expect(events).toHaveLength(3)
    expect(JSON.parse(events[0].slice(6))).toEqual({ text: 'O Grimory.' })
    expect(JSON.parse(events[1].slice(6)).cards[0].id).toBe('case-grimory')
    expect(events[2]).toBe('data: [DONE]')
  })

  it('buildTextStream without cards keeps the old two events', async () => {
    const body = await readStream(buildTextStream('Oi'))
    expect(body).toBe(`data: ${JSON.stringify({ text: 'Oi' })}\n\ndata: [DONE]\n\n`)
  })
})

describe('card hardening', () => {
  it('rejects protocol-relative card images', () => {
    const card = {
      id: 'case-klick',
      kind: 'case',
      href: '/projects/klick',
      title: 'Klick',
      summary: 's',
      image: '//evil.com/x.png',
    }
    expect(sanitizeCards([card])).toEqual([])
    expect(sanitizeCards([{ ...card, image: '/redesign/products/klick-timer.webp' }])).toHaveLength(
      1,
    )
  })

  it('never waits more than a second for blog posts', async () => {
    vi.useFakeTimers()
    vi.mocked(getAllPosts).mockImplementationOnce(() => new Promise(() => {}))
    const pending = buildCardCatalog('pt')
    await vi.advanceTimersByTimeAsync(1000)
    const catalog = await pending
    expect(catalog.some((card) => card.id === 'case-grimory')).toBe(true)
    expect(catalog.some((card) => card.kind === 'post')).toBe(false)
    vi.useRealTimers()
  })

  it('buildTextStream flags the static fallback so the client can offer a retry', async () => {
    const body = await new Response(buildTextStream('Fallback', [], { fallback: true })).text()
    const events = body.split('\n\n').filter(Boolean)
    expect(events).toEqual([
      `data: ${JSON.stringify({ text: 'Fallback' })}`,
      'data: {"fallback":true}',
      'data: [DONE]',
    ])
  })
})
