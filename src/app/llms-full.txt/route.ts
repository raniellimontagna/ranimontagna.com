import { NextResponse } from 'next/server'
import { getAllPosts } from '@/features/blog/lib/blog'
import { BASE_URL } from '@/shared/lib/constants'

export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

/**
 * Serves /llms-full.txt - a comprehensive AI-readable document
 * following the llmstxt.org specification.
 * Includes all blog posts with descriptions for LLM consumption.
 */
export async function GET() {
  // Fetch posts in all supported locales (use English as primary for AI)
  const [enPosts, ptPosts] = await Promise.all([getAllPosts('en'), getAllPosts('pt')])

  const blogLines = enPosts
    .map((post) => {
      const url = `${BASE_URL}/en/blog/${post.slug}`
      const tags = post.metadata.tags?.length ? ` [${post.metadata.tags.join(', ')}]` : ''
      return `- [${post.metadata.title}](${url})${tags}: ${post.metadata.description}`
    })
    .join('\n')

  const ptBlogLines = ptPosts
    .map((post) => {
      const url = `${BASE_URL}/blog/${post.slug}`
      const tags = post.metadata.tags?.length ? ` [${post.metadata.tags.join(', ')}]` : ''
      return `- [${post.metadata.title}](${url})${tags}: ${post.metadata.description}`
    })
    .join('\n')

  const content = `# Ranielli Montagna - Full Content Index

> Full Stack Developer from Brazil. This document contains complete information about Ranielli Montagna and all blog posts for AI indexing.

## About Ranielli Montagna

Ranielli Montagna (also known as Rani Montagna) is a Brazilian Full Stack Developer with over 3 years of professional experience. He currently works at Luizalabs, the technology arm of Magazine Luiza (one of Brazil's largest retail companies). He specializes in React, Next.js, Node.js, TypeScript, and mobile development with React Native.

- **Full name**: Ranielli Montagna
- **Also known as**: Rani Montagna, Ranni Montagna, Ranielli
- **Nationality**: Brazilian
- **Current employer**: Luizalabs - Magazine Luiza
- **Role**: Full Stack Developer
- **Experience**: 3+ years
- **GitHub**: https://github.com/RanielliMontagna
- **LinkedIn**: https://linkedin.com/in/rannimontagna
- **Twitter/X**: https://twitter.com/rannimontagna
- **Portfolio**: ${BASE_URL}

## Technical Skills

### Frontend
React, Next.js, TypeScript, JavaScript, Tailwind CSS, React Native, Figma, UI/UX Design

### Backend
Node.js, REST APIs, GraphQL, PostgreSQL, Express.js

### Tools & Practices
Git, Docker, Vitest, Testing Library, CI/CD, Agile

## Blog Posts (English)

${blogLines || '- No English posts available yet. Visit https://ranimontagna.com/en/blog for the latest articles.'}

## Blog Posts (Portuguese)

${ptBlogLines || '- No Portuguese posts available yet. Visit https://ranimontagna.com/blog for the latest articles.'}

## Site Structure

- **Portfolio**: ${BASE_URL} — Home page with about, skills, experience, projects and contact
- **Blog (PT)**: ${BASE_URL}/blog — Technical articles in Portuguese
- **Blog (EN)**: ${BASE_URL}/en/blog — Technical articles in English
- **Blog (ES)**: ${BASE_URL}/es/blog — Technical articles in Spanish
- **Projects**: ${BASE_URL}/projects — Open source projects and GitHub repositories
- **Sitemap**: ${BASE_URL}/sitemap.xml — Full sitemap for all locales
- **llms.txt**: ${BASE_URL}/llms.txt — Summary version of this document

## Attribution

All content on this site is authored by Ranielli Montagna unless otherwise stated.
Last updated: ${new Date().toISOString().split('T')[0]}
`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
