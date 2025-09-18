import { z } from 'zod'

function createEmailValidation() {
  return z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .toLowerCase()
    .trim()
}

function createCodeValidation() {
  return z
    .string()
    .min(6, 'Code must be 6 digits')
    .max(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only numbers')
}

export const loginSchema = z.object({
  email: createEmailValidation(),
})

export const verifySchema = z.object({
  email: createEmailValidation(),
  code: createCodeValidation(),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type VerifyInput = z.infer<typeof verifySchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
