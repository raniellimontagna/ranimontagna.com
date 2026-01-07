import { Home } from '@/containers'
import { Hero } from '@/containers/home/sections'
import { getFeaturedRepositories } from '@/lib/github'

export default async function Page() {
  const [heroContent, featuredRepos] = await Promise.all([Hero(), getFeaturedRepositories()])

  return <Home heroContent={heroContent} featuredRepos={featuredRepos} />
}
