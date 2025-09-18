import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().min(6, 'Code must be 6 digits').max(6, 'Code must be 6 digits'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type VerifyInput = z.infer<typeof verifySchema>
