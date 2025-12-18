import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ContactForm } from './contactForm'

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'name.label': 'Nome completo',
      'name.placeholder': 'Seu nome completo',
      'email.label': 'Email',
      'email.placeholder': 'seu@email.com',
      'subject.label': 'Assunto',
      'subject.placeholder': 'Sobre o que você gostaria de conversar?',
      'message.label': 'Mensagem',
      'message.placeholder': 'Descreva seu projeto ou dúvida...',
      send: 'Enviar mensagem',
      'validation.name': 'Nome deve ter pelo menos 2 caracteres',
      'validation.email': 'Email inválido',
      'validation.subject': 'Assunto deve ter pelo menos 5 caracteres',
      'validation.message': 'Mensagem deve ter pelo menos 10 caracteres',
    }
    return translations[key] || key
  }),
}))

describe('ContactForm', () => {
  it('renders form fields correctly', () => {
    render(<ContactForm />)

    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Assunto')).toBeInTheDocument()
    expect(screen.getByLabelText('Mensagem')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar mensagem' })).toBeInTheDocument()
  })

  it('has proper form structure', () => {
    render(<ContactForm />)

    const form = screen.getByTestId('contact-form')
    expect(form).toBeInTheDocument()
  })

  it('contains required input fields', () => {
    render(<ContactForm />)

    expect(screen.getByPlaceholderText('Seu nome completo')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Sobre o que você gostaria de conversar?'),
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Descreva seu projeto ou dúvida...')).toBeInTheDocument()
  })
})
