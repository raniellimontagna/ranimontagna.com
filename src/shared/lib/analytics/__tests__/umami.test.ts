import { describe, expect, it } from 'vitest'
import { getUmamiWebsiteId, UMAMI_DOMAINS, UMAMI_SCRIPT_SRC } from '../umami'

describe('getUmamiWebsiteId', () => {
  it('reports with the production website id by default', () => {
    expect(getUmamiWebsiteId({}, false)).toBe('09b5f34d-4053-43c5-9a7c-849f08d43b73')
  })

  it('never reports from a deployment that is not indexed (previews)', () => {
    expect(getUmamiWebsiteId({ NEXT_PUBLIC_UMAMI_WEBSITE_ID: 'abc' }, true)).toBeNull()
  })

  it('takes a configured id and can be switched off', () => {
    expect(getUmamiWebsiteId({ NEXT_PUBLIC_UMAMI_WEBSITE_ID: ' abc ' }, false)).toBe('abc')
    expect(getUmamiWebsiteId({ NEXT_PUBLIC_UMAMI_WEBSITE_ID: 'off' }, false)).toBeNull()
  })

  it('loads the script from the self-hosted instance and limits it to the public hosts', () => {
    expect(UMAMI_SCRIPT_SRC).toBe('https://analytics.ranimontagna.com/script.js')
    expect(UMAMI_DOMAINS.split(',')).toEqual(['ranimontagna.com', 'www.ranimontagna.com'])
  })
})
