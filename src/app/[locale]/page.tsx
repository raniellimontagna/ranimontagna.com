import { setRequestLocale } from 'next-intl/server'
import { Home } from '@/features/home'
import { Hero } from '@/features/home/components/hero/hero'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const heroContent = await Hero()

  return <Home heroContent={heroContent} />
}
