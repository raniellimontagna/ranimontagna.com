type ProjectImageSource = {
  image?: string | null
  images?: string[] | null
}

export function getProjectImages(project: ProjectImageSource): string[] {
  return [...new Set([...(project.images ?? []), project.image ?? ''].filter(Boolean))]
}
