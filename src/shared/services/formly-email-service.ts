interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

interface FormlyResponse {
  success: boolean
  message?: string
  id?: string
}

const FORMLY_BASE_URL = 'https://formly.email'

/**
 * Send contact email via Formly API
 */
export async function sendContactEmail(data: ContactFormData): Promise<FormlyResponse> {
  const payload = {
    access_key: process.env.NEXT_PUBLIC_FORMLY_FORM_ID,
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,

    source: 'Portfolio Website - Ranimontagna.com',
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  }

  const response = await fetch(`${FORMLY_BASE_URL}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
    redirect: 'manual',
  })

  if (response.type === 'opaqueredirect') {
    return { success: true, message: 'Email enviado com sucesso!' }
  }

  if (response.ok) {
    let result: FormlyResponse

    try {
      result = await response.json()
    } catch {
      // JSON parsing failed, but response was ok, treat as success
      return { success: true, message: 'Email enviado com sucesso!' }
    }

    // Check if API returned success: false
    if (!result.success) {
      throw new Error(result.message || 'Erro desconhecido ao enviar email')
    }

    return result
  }

  const errorText = await response.text()
  throw new Error(`HTTP ${response.status}: ${errorText}`)
}

/**
 * Create mailto fallback link for when Formly API fails
 */
export function createMailtoFallback(data: ContactFormData): string {
  const subject = encodeURIComponent(data.subject)
  const body = encodeURIComponent(
    `Nome: ${data.name}\nEmail: ${data.email}\n\nMensagem:\n${data.message}\n\n---\nEnviado via formulário do site em ${new Date().toLocaleString()}`,
  )

  return `mailto:raniellimontagna@gmail.com?subject=${subject}&body=${body}`
}

// Export types
export type { ContactFormData, FormlyResponse }
