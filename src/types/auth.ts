export interface TokenPayload {
  id: string
}

export interface AuthResponse {
  accessToken?: string
  error?: string
}

export interface LoginRequest {
  email: string
}

export interface VerifyRequest {
  email: string
  code: string
}
