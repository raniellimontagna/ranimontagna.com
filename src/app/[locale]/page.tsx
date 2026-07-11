import { setRequestLocale } from 'next-intl/server'
import { Home } from '@/features/home'
import { Hero } from '@/features/home/components/hero/hero'
import { HomeHeader } from '@/features/home/components/home-header'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const heroContent = await Hero()
  const headerContent = <HomeHeader locale={locale as 'en' | 'pt' | 'es'} />

  return <Home headerContent={headerContent} heroContent={heroContent} />
}
