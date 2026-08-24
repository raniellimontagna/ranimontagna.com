import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Repository } from '../../types/github.types'
import { getLanguagesFromRepos, hexToRgba, LANGUAGE_COLORS } from '../project-presentation'

describe('project presentation helpers', () => {
  it('extracts sorted unique languages without a server dependency', () => {
    const repositories = [
      { language: 'TypeScript' },
      { language: 'JavaScript' },
      { language: 'TypeScript' },
      { language: null },
    ] as Repository[]

    expect(getLanguagesFromRepos(repositories)).toEqual(['JavaScript', 'TypeScript'])
    expect(LANGUAGE_COLORS.TypeScript).toBe('#3178c6')
    expect(hexToRgba('#3178c6', 0.1)).toBe('rgba(49, 120, 198, 0.1)')
  })

  it('does not import server-only GitHub or Next cache packages', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/features/projects/lib/project-presentation.ts'),
      'utf8',
    )

    expect(source).not.toMatch(/@octokit\/rest|next\/cache/)
  })
})
