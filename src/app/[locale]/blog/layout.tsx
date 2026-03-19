import { BlogHeader } from '@/features/blog/components'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogHeader />
      <main className="min-h-screen mt-16">{children}</main>
    </>
  )
}
