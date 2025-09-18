import AuthManager from './auth-manager'
import UserService from './user-service'
import OtpService from './otp-service'

interface AuthResponse {
  error?: string
}

interface VerifyResponse {
  accessToken?: string
  refreshToken?: string
  error?: string
}

async function loginUser(email: string): Promise<AuthResponse> {
  try {
    const userId = await UserService.getIdFromEmail(email)
    if (!userId) {
      return { error: 'Failed to create user account. Please try again.' }
    }

    const code = OtpService.generate()
    const isSaved = await OtpService.save(userId, code)
    if (!isSaved) {
      return { error: 'Failed to generate login code. Please try again.' }
    }

    const emailSent = await OtpService.send(email, code)
    if (!emailSent) {
      return { error: 'Failed to send login code. Please try again.' }
    }

    return {}
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Something went wrong. Please try again.' }
  }
}

async function verifyUser(email: string, code: string): Promise<VerifyResponse> {
  try {
    const user = await UserService.findByEmail(email)
    if (!user) {
      return { error: 'User not found. Please try logging in again.' }
    }

    const isCodeValid = await OtpService.verify(user.id, code)
    if (!isCodeValid) {
      return { error: 'Invalid or expired code. Please try again.' }
    }

    if (!user.emailConfirmedAt) {
      const initialized = await UserService.init(user.id)
      if (!initialized) {
        return { error: 'Failed to initialize user. Please try again.' }
      }
    }

    const accessToken = AuthManager.createAccessToken(user.id)
    const refreshToken = AuthManager.createRefreshToken(user.id)

    return { accessToken, refreshToken }
  } catch (error) {
    console.error('Verify error:', error)
    return { error: 'Something went wrong. Please try again.' }
  }
}

function getUserIdFromToken(token: string): string | null {
  return AuthManager.getUserId(token)
}

function refreshUserTokens(
  refreshToken: string
): { accessToken?: string; refreshToken?: string } | null {
  return AuthManager.refreshAccessToken(refreshToken)
}

function validateRoute(pathname: string): boolean {
  return AuthManager.isPublicRoute(pathname)
}

function validateToken(token: string): boolean {
  return AuthManager.isValidToken(token)
}

const BackendAuthService = {
  login: loginUser,
  verify: verifyUser,
  getUserId: getUserIdFromToken,
  refreshTokens: refreshUserTokens,
  isPublicRoute: validateRoute,
  isValidToken: validateToken,
}

export default BackendAuthService
