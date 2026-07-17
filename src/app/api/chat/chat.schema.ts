import { z } from 'zod'

const questionSchema = z.string().trim().min(1).max(500)

export const requestSchema = z
  .strictObject({
    locale: z.enum(['pt', 'en', 'es']).default('pt'),
    message: questionSchema,
    previousQuestions: z.array(questionSchema).max(5).default([]),
  })
  .superRefine((value, context) => {
    const aggregateLength =
      value.message.length +
      value.previousQuestions.reduce((total, question) => total + question.length, 0)

    if (aggregateLength > 3000) {
      context.addIssue({ code: 'custom', message: 'Chat payload is too large' })
    }
  })

export type ParsedRequest = z.infer<typeof requestSchema>
