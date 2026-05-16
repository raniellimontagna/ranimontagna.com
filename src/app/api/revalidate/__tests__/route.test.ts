import { createHmac } from 'node:crypto'

const { mockRevalidateTag } = vi.hoisted(() => ({
  mockRevalidateTag: vi.fn(),
}))

const { mockInvalidateBlogCache } = vi.hoisted(() => ({
  mockInvalidateBlogCache: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('next/cache', () => ({
  revalidateTag: mockRevalidateTag,
}))

vi.mock('@/features/blog/lib/blog-cache', () => ({
  invalidateBlogCache: mockInvalidateBlogCache,
}))

import { POST } from '../route'

const createRequest = (headers: HeadersInit = {}, body = '{"ref":"refs/heads/main"}') =>
  new Request('http://localhost/api/revalidate', {
    method: 'POST',
    headers,
    body,
  })

describe('revalidate route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('WEBHOOK_SECRET', 'test-secret')
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns 500 when the webhook secret is missing', async () => {
    vi.unstubAllEnvs()

    const response = await POST(createRequest() as never)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ error: 'Webhook not configured' })
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('rejects requests without valid authentication', async () => {
    const response = await POST(createRequest() as never)

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('rejects requests with an invalid bearer token', async () => {
    const response = await POST(
      createRequest({
        Authorization: 'Bearer invalid-secret',
      }) as never,
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('revalidates posts when a valid bearer token is provided', async () => {
    const response = await POST(
      createRequest({
        Authorization: 'Bearer test-secret',
      }) as never,
    )

    expect(response.status).toBe(200)
    expect(mockRevalidateTag).toHaveBeenCalledWith('posts', 'max')
    expect(mockInvalidateBlogCache).toHaveBeenCalled()
    await expect(response.json()).resolves.toMatchObject({
      revalidated: true,
    })
  })

  it('rejects requests with an invalid GitHub signature', async () => {
    const response = await POST(
      createRequest({
        'x-hub-signature-256': 'sha256=invalid',
      }) as never,
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('revalidates posts when a valid GitHub signature is provided', async () => {
    const body = '{"ref":"refs/heads/main"}'
    const signature = `sha256=${createHmac('sha256', 'test-secret').update(body).digest('hex')}`

    const response = await POST(
      createRequest(
        {
          'x-hub-signature-256': signature,
        },
        body,
      ) as never,
    )

    expect(response.status).toBe(200)
    expect(mockRevalidateTag).toHaveBeenCalledWith('posts', 'max')
    expect(mockInvalidateBlogCache).toHaveBeenCalled()
    await expect(response.json()).resolves.toMatchObject({
      revalidated: true,
    })
  })

  it('keeps revalidation successful when blog cache invalidation fails', async () => {
    mockInvalidateBlogCache.mockRejectedValueOnce(new Error('redis down'))

    const response = await POST(
      createRequest({
        Authorization: 'Bearer test-secret',
      }) as never,
    )

    expect(response.status).toBe(200)
    expect(mockRevalidateTag).toHaveBeenCalledWith('posts', 'max')
    await expect(response.json()).resolves.toMatchObject({
      revalidated: true,
    })
  })
})
