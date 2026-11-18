type ShareSite = {
  locale: string
  title: string
  text: string
  /** Without a share sheet, copy the text with the link (when the text is the point). */
  copyText?: boolean
}

/** Shares the home page in the visitor's language: the share sheet, else the clipboard. */
export async function shareSite({
  locale,
  title,
  text,
  copyText = false,
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
    await navigator.clipboard.writeText(copyText ? `${text} ${url}` : url)
    return 'copied'
  } catch {
    return 'failed'
  }
}
