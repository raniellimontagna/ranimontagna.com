import { z } from 'zod'

const emptyString = z.literal('')

export const contactFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(5).max(200),
  message: z.string().trim().min(10).max(5000),
  website: z.union([emptyString, z.string().trim().max(0)]).optional().default(''),
})

export type ContactFormInput = z.input<typeof contactFormSchema>
export type ContactFormData = z.output<typeof contactFormSchema>

export interface ContactFormResponse {
  success: boolean
  message?: string
  id?: string
}
