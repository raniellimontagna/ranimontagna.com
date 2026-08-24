import type { ContactFormInput, ContactFormResponse } from '@/shared/lib/contact-form'

/**
 * Send contact email through the internal API route so the provider key
 * stays on the server instead of the client bundle.
 */
export async function sendContactEmail(data: ContactFormInput): Promise<ContactFormResponse> {
  const payload = {
    ...data,
    website: data.website ?? '',
  }

  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (response.ok) {
    let result: unknown
    try {
      result = await response.json()
    } catch {
      throw new Error('Contact request failed')
    }

    if (!result || typeof result !== 'object' || !('success' in result) || result.success !== true) {
      throw new Error('Contact request failed')
    }

    return result as ContactFormResponse
  }

  throw new Error('Contact request failed')
}

/**
 * Create mailto fallback link for when Formly API fails
 */
export function createMailtoFallback(data: ContactFormInput): string {
  const subject = encodeURIComponent(data.subject)
  const body = encodeURIComponent(
    `Nome: ${data.name}\nEmail: ${data.email}\n\nMensagem:\n${data.message}\n\n---\nEnviado via formulário do site em ${new Date().toLocaleString()}`,
  )

  return `mailto:contato@ranimontagna.com?subject=${subject}&body=${body}`
}

export type { ContactFormInput, ContactFormResponse }
