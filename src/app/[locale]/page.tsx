import { Home } from '@/features/home'
import { Hero } from '@/features/home/components/hero/hero'

export default async function Page() {
  const heroContent = await Hero()

  return <Home heroContent={heroContent} />
}
