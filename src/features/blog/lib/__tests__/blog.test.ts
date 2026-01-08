import { getAllPosts, getPostBySlug } from '../blog'

const { mockGetContent } = vi.hoisted(() => ({
  mockGetContent: vi.fn(),
}))

vi.mock('@octokit/rest', () => {
  const Octokit = vi.fn()
  Octokit.prototype.repos = {
    getContent: mockGetContent,
  }
  return { Octokit }
})

vi.mock('next/cache', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: Mocking cache wrapper
  unstable_cache: (fn: any) => fn,
}))

describe('blog library', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to encode content
  const encodeContent = (content: string) => Buffer.from(content).toString('base64')

  const mockMDXContent = `---
title: "Test Post"
date: "2024-01-01"
description: "Test Description"
published: true
tags: ["react"]
---
# Hello World`

  const mockFile = {
    name: '2024-01-01-test-post.mdx',
    type: 'file',
    path: 'posts/en/2024-01-01-test-post.mdx',
    sha: '123',
    content: encodeContent(mockMDXContent),
  }

  describe('getAllPosts', () => {
    it('fetches and returns parsed posts', async () => {
      // Mock list files response
      mockGetContent.mockResolvedValueOnce({
        data: [mockFile],
      })

      // Mock get file content response
      mockGetContent.mockResolvedValueOnce({
        data: mockFile,
      })

      const posts = await getAllPosts('en')

      expect(posts).toHaveLength(1)
      expect(posts[0].slug).toBe('test-post')
      expect(posts[0].metadata.title).toBe('Test Post')
    })

    it('filters out unpublished posts', async () => {
      const unpublishedContent = `---
title: "Unpublished"
date: "2024-01-01"
published: false
---`
      const unpublishedFile = {
        ...mockFile,
        name: '2024-01-01-unpublished.mdx',
        content: encodeContent(unpublishedContent),
      }

      mockGetContent.mockResolvedValueOnce({ data: [unpublishedFile] })
      mockGetContent.mockResolvedValueOnce({ data: unpublishedFile })

      const posts = await getAllPosts('en')
      expect(posts).toHaveLength(0)
    })

    it('filters out future posts', async () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const dateStr = futureDate.toISOString().split('T')[0]

      const futureContent = `---
title: "Future"
date: "${dateStr}"
published: true
---`
      // Note: Filename parsing regex expects digits, so we construct a matching name
      // The regex is /^(\d{4}-\d{2}-\d{2})-(.+)\.mdx$/
      const futureFile = {
        ...mockFile,
        name: `${dateStr}-future.mdx`,
        content: encodeContent(futureContent),
      }

      mockGetContent.mockResolvedValueOnce({ data: [futureFile] })
      mockGetContent.mockResolvedValueOnce({ data: futureFile })

      const posts = await getAllPosts('en')
      expect(posts).toHaveLength(0)
    })
  })

  describe('getPostBySlug', () => {
    it('fetches specific post', async () => {
      mockGetContent.mockResolvedValueOnce({ data: [mockFile] }) // List files looking for slug match
      mockGetContent.mockResolvedValueOnce({ data: mockFile }) // Get content

      const post = await getPostBySlug('test-post', 'en')
      expect(post).toBeDefined()
      expect(post.slug).toBe('test-post')
      expect(post.content).toContain('# Hello World')
    })

    it('throws error if post not found', async () => {
      mockGetContent.mockResolvedValueOnce({ data: [] }) // No files

      await expect(getPostBySlug('non-existent', 'en')).rejects.toThrow('Post not found')
    })
  })

  describe('error handling', () => {
    it('handles error when fetching individual post fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock list files response with one file
      mockGetContent.mockResolvedValueOnce({
        data: [mockFile],
      })

      // Mock get file content to throw error
      mockGetContent.mockRejectedValueOnce(new Error('Network error'))

      const posts = await getAllPosts('en')

      // Should return empty array since the only post failed
      expect(posts).toHaveLength(0)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching post'),
        expect.any(Error),
      )

      consoleErrorSpy.mockRestore()
    })

    it('handles error when listing posts fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock list files to throw error
      mockGetContent.mockRejectedValueOnce(new Error('API error'))

      const posts = await getAllPosts('en')

      // Should return empty array on error
      expect(posts).toHaveLength(0)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching posts for locale'),
        expect.any(Error),
      )

      consoleErrorSpy.mockRestore()
    })
  })
})
