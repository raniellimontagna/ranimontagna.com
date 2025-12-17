// Mock fs module
vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(() => true),
    readdirSync: vi.fn(() => [
      '2025-12-10-test-post.mdx',
      '2025-12-09-second-post.mdx',
      '2025-12-08-welcome.mdx',
    ]),
    readFileSync: vi.fn(
      () => `---
title: Test Post
date: '2025-12-10'
description: A test post description
tags:
  - react
  - test
---

# Test Content

This is the post content.`,
    ),
  },
}))

// Import after mocking
import { getAdjacentPosts, getAllPosts, getPostBySlug } from './blog'

describe('blog utilities', () => {
  describe('getPostBySlug', () => {
    it('should return a post with correct slug', () => {
      const post = getPostBySlug('test-post', 'pt')

      expect(post.slug).toBe('test-post')
      expect(post.metadata.title).toBe('Test Post')
    })

    it('should parse post metadata correctly', () => {
      const post = getPostBySlug('test-post', 'pt')

      expect(post.metadata.description).toBe('A test post description')
      expect(post.metadata.tags).toContain('react')
    })

    it('should parse content correctly', () => {
      const post = getPostBySlug('test-post', 'pt')

      expect(post.content).toContain('Test Content')
    })
  })

  describe('getAllPosts', () => {
    it('should return array of posts', () => {
      const posts = getAllPosts('pt')

      expect(Array.isArray(posts)).toBe(true)
    })
  })

  describe('getAdjacentPosts', () => {
    it('should return prev and next posts object', () => {
      const adjacent = getAdjacentPosts('second-post', 'pt')

      expect(adjacent).toHaveProperty('prev')
      expect(adjacent).toHaveProperty('next')
    })

    it('should return null for non-existent post', () => {
      const adjacent = getAdjacentPosts('non-existent', 'pt')

      expect(adjacent.prev).toBeNull()
      expect(adjacent.next).toBeNull()
    })
  })
})
