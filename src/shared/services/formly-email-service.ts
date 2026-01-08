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

class FormlyEmailService {
  private readonly baseUrl = 'https://formly.email'
  private readonly formId: string

  constructor() {
    this.formId = process.env.NEXT_PUBLIC_FORMLY_FORM_ID || ''

    if (!this.formId) {
      console.warn('NEXT_PUBLIC_FORMLY_FORM_ID não configurado. Configure no arquivo .env.local')
    }
  }

  async sendContactEmail(data: ContactFormData): Promise<FormlyResponse> {
    if (!this.formId) {
      throw new Error('Form ID não configurado. Configure NEXT_PUBLIC_FORMLY_FORM_ID no .env.local')
    }

    const payload = {
      access_key: this.formId,
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,

      source: 'Portfolio Website - Raniellimontagna.com',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    const response = await fetch(`${this.baseUrl}/submit`, {
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
      try {
        const result: FormlyResponse = await response.json()

        if (!result.success) {
          throw new Error(result.message || 'Erro desconhecido ao enviar email')
        }

        return result
      } catch {
        return { success: true, message: 'Email enviado com sucesso!' }
      }
    }

    const errorText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }

  createMailtoFallback(data: ContactFormData): string {
    const subject = encodeURIComponent(data.subject)
    const body = encodeURIComponent(
      `Nome: ${data.name}\nEmail: ${data.email}\n\nMensagem:\n${data.message}\n\n---\nEnviado via formulário do site em ${new Date().toLocaleString()}`,
    )

    return `mailto:raniellimontagna@gmail.com?subject=${subject}&body=${body}`
  }
}

export const formlyEmailService = new FormlyEmailService()
