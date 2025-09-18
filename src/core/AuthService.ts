import Api from './Api'
import TokenManager from './TokenManager'

interface User {
  id: string
  email: string
  emailConfirmed: boolean
}

interface AuthResponse {
  success: boolean
  error?: string
  user?: User
  accessToken?: string
  refreshToken?: string
}

function createCookieOptions(): string {
  const maxAge = 7 * 24 * 60 * 60
  const isProduction = process.env.NODE_ENV === 'production'

  return ['path=/', `max-age=${maxAge}`, 'samesite=lax', ...(isProduction ? ['secure'] : [])].join(
    '; '
  )
}

function setRefreshTokenCookie(refreshToken: string): void {
  const options = createCookieOptions()
  document.cookie = `refresh-token=${refreshToken}; ${options}`
}

function handleAuthSuccess(accessToken: string, refreshToken?: string): void {
  TokenManager.set(accessToken)

  if (refreshToken) {
    setRefreshTokenCookie(refreshToken)
  }
}

async function loginWithEmail(email: string): Promise<AuthResponse> {
  try {
    await Api.post('/api/auth/login', { email })
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    }
  }
}

async function verifyCode(email: string, code: string): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    })

    const data = await response.json()

    if (response.ok && data.accessToken) {
      handleAuthSuccess(data.accessToken, data.refreshToken)

      return {
        success: true,
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }
    }

    return {
      success: false,
      error: data.error || 'Verification failed',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    }
  }
}

async function getCurrentUser(): Promise<User> {
  const response = await Api.get<{ user: User }>('/api/auth/me')
  return response.user
}

async function logoutUser(): Promise<void> {
  try {
    await Api.post('/api/auth/logout')
  } finally {
    TokenManager.remove()
  }
}

async function checkAuthentication(): Promise<{ isAuthenticated: boolean; user?: User }> {
  const token = TokenManager.getValid()

  if (!token) {
    return { isAuthenticated: false }
  }

  try {
    const user = await getCurrentUser()
    return { isAuthenticated: true, user }
  } catch {
    TokenManager.remove()
    return { isAuthenticated: false }
  }
}

const AuthService = {
  login: loginWithEmail,
  verify: verifyCode,
  getCurrentUser,
  logout: logoutUser,
  checkAuth: checkAuthentication,
}

export default AuthService
