type ShareSite = { locale: string; title: string; text: string }

/** Shares the home page in the visitor's language: the share sheet, else the clipboard. */
export async function shareSite({
  locale,
  title,
  text,
}: ShareSite): Promise<'shared' | 'copied' | 'failed'> {
  const url = `${window.location.origin}${locale === 'pt' ? '/' : `/${locale}`}`
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url })
      return 'shared'
    } catch {
      // Cancelled by the visitor.
      return 'failed'
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}
