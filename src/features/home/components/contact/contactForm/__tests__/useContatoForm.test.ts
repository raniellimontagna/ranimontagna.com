import { renderHook } from '@testing-library/react'
import type { FormEvent } from 'react'
import { act } from 'react'
import { useContactForm } from '../useContatoForm'

type ContactField = Parameters<ReturnType<typeof useContactForm>['register']>[0]
type ContactChangeEvent = Parameters<ReturnType<ReturnType<typeof useContactForm>['register']>['onChange']>[0]

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockSendContactEmail = vi.fn()
const mockCreateMailtoFallback = vi.fn()

// Mock formly email service functions
vi.mock('@/shared/services/formly-email-service', () => ({
  sendContactEmail: (...args: unknown[]) => mockSendContactEmail(...args),
  createMailtoFallback: (...args: unknown[]) => mockCreateMailtoFallback(...args),
}))

describe('useContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateMailtoFallback.mockReturnValue('mailto:test@example.com')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with correct properties', () => {
    const { result } = renderHook(() => useContactForm())

    expect(result.current.t).toBeDefined()
    expect(result.current.register).toBeDefined()
    expect(result.current.handleSubmit).toBeDefined()
    expect(result.current.errors).toBeDefined()
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.submitStatus).toBe('idle')
    expect(result.current.onSubmit).toBeDefined()
  })

  it('successfully submits form data', async () => {
    mockSendContactEmail.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useContactForm())

    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message.',
      website: '',
    }

    await act(async () => {
      await result.current.onSubmit(formData)
    })

    expect(mockSendContactEmail).toHaveBeenCalledWith(formData)
    expect(result.current.submitStatus).toBe('success')
    expect(result.current.isSubmitting).toBe(false)
  })

  it('handles submission error and opens mailto fallback', async () => {
    vi.useFakeTimers()
    mockSendContactEmail.mockRejectedValueOnce(new Error('Network error'))

    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const { result } = renderHook(() => useContactForm())

    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message.',
      website: '',
    }

    await act(async () => {
      await result.current.onSubmit(formData)
    })

    expect(result.current.submitStatus).toBe('error')
    expect(result.current.isSubmitting).toBe(false)
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(mockCreateMailtoFallback).toHaveBeenCalledWith(formData)

    // Fast-forward to open mailto
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(windowOpenSpy).toHaveBeenCalledWith('mailto:test@example.com')

    windowOpenSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('blocks invalid form data before submit', async () => {
    const { result } = renderHook(() => useContactForm())
    const submit = vi.fn()

    await act(async () => {
      await result.current.handleSubmit(submit)({
        preventDefault: vi.fn(),
      } as unknown as FormEvent<HTMLFormElement>)
    })

    expect(submit).not.toHaveBeenCalled()
    expect(result.current.errors.name).toBeDefined()
    expect(result.current.errors.email).toBeDefined()
    expect(result.current.errors.subject).toBeDefined()
    expect(result.current.errors.message).toBeDefined()
  })

  it('normalizes valid form data before submit', async () => {
    const { result } = renderHook(() => useContactForm())
    const submit = vi.fn()
    const changeField = (field: ContactField, value: string) => {
      act(() => {
        result.current.register(field).onChange({
          currentTarget: { value },
        } as ContactChangeEvent)
      })
    }

    changeField('name', ' John Doe ')
    changeField('email', ' john@example.com ')
    changeField('subject', ' Test Subject ')
    changeField('message', ' This is a test message. ')

    await act(async () => {
      await result.current.handleSubmit(submit)({
        preventDefault: vi.fn(),
      } as unknown as FormEvent<HTMLFormElement>)
    })

    expect(submit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message.',
      website: '',
    })
    expect(result.current.errors).toEqual({})
  })
})
