import { BlogHeader } from '@/features/blog/components'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogHeader />
      <main id="main-content" tabIndex={-1} className="min-h-screen mt-16">
        {children}
      </main>
    </>
  )
}
