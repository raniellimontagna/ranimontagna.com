// Mock Octokit with hoisted mockGetContent
const { mockGetContent } = vi.hoisted(() => ({
  mockGetContent: vi.fn(),
}))

vi.mock('@octokit/rest', () => ({
  Octokit: class {
    repos = {
      getContent: mockGetContent,
    }
  },
}))

// Mock unstable_cache to pass through functions directly in tests
vi.mock('next/cache', () => ({
  unstable_cache: (fn: unknown) => fn,
}))

// Import after mocking
import { getAdjacentPosts, getAllPosts, getPostBySlug } from './blog'

const mockFiles = [
  {
    name: '2025-12-10-test-post.mdx',
    path: 'posts/pt/2025-12-10-test-post.mdx',
    sha: 'abc123',
    type: 'file' as const,
  },
  {
    name: '2025-12-09-second-post.mdx',
    path: 'posts/pt/2025-12-09-second-post.mdx',
    sha: 'def456',
    type: 'file' as const,
  },
  {
    name: '2025-12-08-welcome.mdx',
    path: 'posts/pt/2025-12-08-welcome.mdx',
    sha: 'ghi789',
    type: 'file' as const,
  },
]

const mockFileContent = `---
title: Test Post
date: '2025-12-10'
description: A test post description
tags:
  - react
  - test
published: true
---

# Test Content

This is the post content.`

describe('blog utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPostBySlug', () => {
    it('should return a post with correct slug', async () => {
      // Mock directory listing
      mockGetContent.mockResolvedValueOnce({
        data: mockFiles,
      })

      // Mock file content
      mockGetContent.mockResolvedValueOnce({
        data: {
          content: Buffer.from(mockFileContent).toString('base64'),
        },
      })

      const post = await getPostBySlug('test-post', 'pt')

      expect(post.slug).toBe('test-post')
      expect(post.metadata.title).toBe('Test Post')
    })

    it('should parse post metadata correctly', async () => {
      mockGetContent.mockResolvedValueOnce({ data: mockFiles })
      mockGetContent.mockResolvedValueOnce({
        data: { content: Buffer.from(mockFileContent).toString('base64') },
      })

      const post = await getPostBySlug('test-post', 'pt')

      expect(post.metadata.description).toBe('A test post description')
      expect(post.metadata.tags).toContain('react')
      expect(post.metadata.published).toBe(true)
    })

    it('should parse content correctly', async () => {
      mockGetContent.mockResolvedValueOnce({ data: mockFiles })
      mockGetContent.mockResolvedValueOnce({
        data: { content: Buffer.from(mockFileContent).toString('base64') },
      })

      const post = await getPostBySlug('test-post', 'pt')

      expect(post.content).toContain('Test Content')
    })

    it('should throw error for non-existent post', async () => {
      mockGetContent.mockResolvedValueOnce({ data: mockFiles })

      await expect(getPostBySlug('non-existent', 'pt')).rejects.toThrow('Post not found')
    })
  })

  describe('getAllPosts', () => {
    it('should return array of posts', async () => {
      mockGetContent.mockResolvedValueOnce({ data: mockFiles })

      // Mock file content for each post
      for (let i = 0; i < mockFiles.length; i++) {
        mockGetContent.mockResolvedValueOnce({
          data: { content: Buffer.from(mockFileContent).toString('base64') },
        })
      }

      const posts = await getAllPosts('pt')

      expect(Array.isArray(posts)).toBe(true)
      expect(posts.length).toBeGreaterThan(0)
    })

    it('should filter unpublished posts', async () => {
      const unpublishedContent = mockFileContent.replace('published: true', 'published: false')

      mockGetContent.mockResolvedValueOnce({ data: mockFiles })

      // First post unpublished, others published
      mockGetContent.mockResolvedValueOnce({
        data: { content: Buffer.from(unpublishedContent).toString('base64') },
      })
      mockGetContent.mockResolvedValueOnce({
        data: { content: Buffer.from(mockFileContent).toString('base64') },
      })
      mockGetContent.mockResolvedValueOnce({
        data: { content: Buffer.from(mockFileContent).toString('base64') },
      })

      const posts = await getAllPosts('pt')

      expect(posts.length).toBe(2) // Should only return published posts
    })

    it('should sort posts by date descending', async () => {
      mockGetContent.mockResolvedValueOnce({ data: mockFiles })

      for (let i = 0; i < mockFiles.length; i++) {
        mockGetContent.mockResolvedValueOnce({
          data: { content: Buffer.from(mockFileContent).toString('base64') },
        })
      }

      const posts = await getAllPosts('pt')

      // Verify posts are sorted by date (newest first)
      for (let i = 0; i < posts.length - 1; i++) {
        expect(posts[i].metadata.date >= posts[i + 1].metadata.date).toBe(true)
      }
    })
  })

  describe('getAdjacentPosts', () => {
    beforeEach(async () => {
      mockGetContent.mockResolvedValueOnce({ data: mockFiles })

      for (let i = 0; i < mockFiles.length; i++) {
        mockGetContent.mockResolvedValueOnce({
          data: { content: Buffer.from(mockFileContent).toString('base64') },
        })
      }
    })

    it('should return prev and next posts object', async () => {
      const adjacent = await getAdjacentPosts('second-post', 'pt')

      expect(adjacent).toHaveProperty('prev')
      expect(adjacent).toHaveProperty('next')
    })

    it('should return null for non-existent post', async () => {
      const adjacent = await getAdjacentPosts('non-existent', 'pt')

      expect(adjacent.prev).toBeNull()
      expect(adjacent.next).toBeNull()
    })

    it('should return correct adjacent posts', async () => {
      const adjacent = await getAdjacentPosts('second-post', 'pt')

      // Second post should have a newer post (next) and an older post (prev)
      expect(adjacent.next).not.toBeNull()
      expect(adjacent.prev).not.toBeNull()
    })
  })
})
