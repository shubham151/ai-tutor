// Core User Types
export interface User {
  id: string
  email: string
  emailConfirmed: boolean
  emailConfirmedAt?: Date | null
  createdAt?: Date | string
}

export interface UserProfile extends User {
  firstName?: string
  lastName?: string
  avatar?: string
  lastLoginAt?: Date | string
}

// Authentication State Types
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextValue extends AuthState {
  login: (email: string) => Promise<AuthResponse>
  verify: (email: string, code: string) => Promise<AuthResponse>
  logout: () => Promise<void>
  requireAuth: () => void
  checkAuth: () => Promise<void>
}

// Request/Response Types
export interface LoginRequest {
  email: string
}

export interface VerifyRequest {
  email: string
  code: string
}

export interface AuthResponse {
  success: boolean
  error?: string
  user?: User
  accessToken?: string
  refreshToken?: string
}

export interface RefreshTokenResponse {
  accessToken?: string
  refreshToken?: string
  error?: string
}

export interface UserResponse {
  user: User
}

// Token Types
export interface TokenPayload {
  id: string
  exp?: number
  iat?: number
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

// Form Types
export interface LoginFormData {
  email: string
}

export interface VerifyFormData {
  code: string
}

export interface AuthFormErrors {
  email?: string
  code?: string
  general?: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: AuthFormErrors
}

// Component Props Types
export interface LoginFormProps {
  onSubmit: (email: string) => Promise<void>
  isLoading?: boolean
  error?: string
  success?: string
}

export interface VerifyFormProps {
  email: string
  onSubmit: (code: string) => Promise<void>
  onResend: () => Promise<void>
  onBack: () => void
  isLoading?: boolean
  error?: string
  success?: string
}

export interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description: string
  showFooter?: boolean
}

export interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}

// Database Models (Backend)
export interface UserModel {
  id: string
  email: string
  emailConfirmedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface OtpCodeModel {
  id: string
  userId: string
  code: string
  expiresAt: Date
  createdAt: Date
  used?: boolean
}

// Service Types
export interface AuthServiceConfig {
  accessTokenExpiry: string
  refreshTokenExpiry: string
  otpExpiry: number // minutes
  resendCooldown: number // seconds
}

export interface EmailConfig {
  from: string
  templates: {
    otpCode: string
  }
}

// Hook State Types
export interface UseAuthFormState {
  isLoading: boolean
  error: string
  success: string
}

export interface UseLoginFormState {
  email: string
  errors: AuthFormErrors
}

export interface UseVerifyFormState {
  code: string
  resendCooldown: number
}

export interface UseAuthStepState {
  currentStep: 'login' | 'verify'
  email: string
}

// API Client Types
export interface ApiRequestConfig extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown> | string
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  success?: boolean
}

// Middleware Types
export interface AuthenticatedRequest extends Request {
  userId?: string
}

export interface MiddlewareAuthResult {
  isAuthenticated: boolean
  userId?: string
  error?: string
}

// Validation Types
export interface ValidationRule<T = string> {
  validate: (value: T) => string | undefined
  message?: string
}

export interface EmailValidationOptions {
  required?: boolean
  minLength?: number
  maxLength?: number
  customMessage?: string
}

export interface OtpValidationOptions {
  length?: number
  numbersOnly?: boolean
  customMessage?: string
}

// Error Types
export interface AuthError extends Error {
  code?:
    | 'INVALID_TOKEN'
    | 'EXPIRED_TOKEN'
    | 'INVALID_CREDENTIALS'
    | 'USER_NOT_FOUND'
    | 'OTP_EXPIRED'
  statusCode?: number
}

export interface ValidationError extends Error {
  field: string
  value: unknown
}

// Cookie Types
export interface CookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  maxAge?: number
  path?: string
}

export interface AuthCookies {
  accessToken?: string
  refreshToken?: string
}

// Environment Types
export interface AuthEnvironmentVariables {
  SECRET_ACCESS_TOKEN: string
  SECRET_REFRESH_TOKEN: string
  RESEND_API_KEY: string
  DATABASE_URL?: string
}

// Utility Types
export type AuthStep = 'login' | 'verify'
export type AuthVariant = 'login' | 'register' | 'reset'
export type TokenType = 'access' | 'refresh'

// Type Guards
export type UserWithConfirmedEmail = User & { emailConfirmed: true }
export type AuthenticatedUser = UserWithConfirmedEmail

// Response Unions
export type LoginResult = AuthResponse
export type VerifyResult = AuthResponse
export type LogoutResult = { success: boolean; error?: string }

// Form Event Types
export type LoginSubmitHandler = (email: string) => Promise<void>
export type VerifySubmitHandler = (code: string) => Promise<void>
export type ResendHandler = () => Promise<void>
export type BackHandler = () => void

// Status Types
export type AuthStatus = 'idle' | 'loading' | 'success' | 'error'
export type RequestStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected'

// Permission Types (for future use)
export interface Permission {
  id: string
  name: string
  resource: string
  action: string
}

export interface Role {
  id: string
  name: string
  permissions: Permission[]
}

export interface UserWithRole extends User {
  role?: Role
}
