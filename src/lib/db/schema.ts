export interface User {
  id: string
  email: string
  emailConfirmedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface OtpCode {
  id: string
  userId: string
  code: string
  expiresAt: Date
  createdAt: Date
}
