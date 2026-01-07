import { Home } from '@/containers'
import { Hero } from '@/containers/home/sections'

export default async function Page() {
  const heroContent = await Hero()

  return <Home heroContent={heroContent} />
}
