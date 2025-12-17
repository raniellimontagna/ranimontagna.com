import { cn } from './utils'

describe('cn utility', () => {
  it('should merge class names', () => {
    const result = cn('foo', 'bar')

    expect(result).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'active', false && 'hidden')

    expect(result).toBe('base active')
  })

  it('should merge tailwind classes properly', () => {
    const result = cn('p-4', 'p-2')

    expect(result).toBe('p-2')
  })

  it('should handle undefined and null', () => {
    const result = cn('base', undefined, null, 'end')

    expect(result).toBe('base end')
  })

  it('should handle array of classes', () => {
    const result = cn(['foo', 'bar'])

    expect(result).toBe('foo bar')
  })
})
