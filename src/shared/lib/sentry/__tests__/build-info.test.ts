import { getSentryBuildInfo } from '../build-info'

const builtAt = new Date('2026-03-04T05:06:59.999Z')

describe('getSentryBuildInfo', () => {
  it('reports production with a version and UTC build time release by default', () => {
    expect(getSentryBuildInfo({}, '1.28.0', builtAt)).toEqual({
      environment: 'production',
      release: 'ranimontagna@1.28.0+202603040506',
    })
  })

  it('reports preview builds as preview', () => {
    expect(getSentryBuildInfo({ SITE_NOINDEX: '1' }, '1.28.0', builtAt).environment).toBe('preview')
    expect(getSentryBuildInfo({ SITE_NOINDEX: '0' }, '1.28.0', builtAt).environment).toBe(
      'production',
    )
  })

  it('uses the trimmed SENTRY_ENVIRONMENT and SENTRY_RELEASE when set', () => {
    expect(
      getSentryBuildInfo(
        { SENTRY_ENVIRONMENT: ' staging ', SENTRY_RELEASE: ' abc123 ', SITE_NOINDEX: '1' },
        '1.28.0',
        builtAt,
      ),
    ).toEqual({ environment: 'staging', release: 'abc123' })
  })

  it('ignores blank overrides', () => {
    expect(
      getSentryBuildInfo(
        { SENTRY_ENVIRONMENT: '   ', SENTRY_RELEASE: '', SITE_NOINDEX: '1' },
        '2.0.0',
        builtAt,
      ),
    ).toEqual({ environment: 'preview', release: 'ranimontagna@2.0.0+202603040506' })
  })

  it('stamps the build time in UTC, not local time', () => {
    const lateEvening = new Date('2026-12-31T23:59:00-03:00')

    expect(getSentryBuildInfo({}, '1.0.0', lateEvening).release).toBe(
      'ranimontagna@1.0.0+202701010259',
    )
  })
})
