function isServerSide(): boolean {
  return typeof window === 'undefined'
}

function parseTokenPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null

    const payloadJson = atob(parts[1])
    return JSON.parse(payloadJson)
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseTokenPayload(token)
  if (!payload || typeof payload.exp !== 'number') return true

  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp <= currentTime
}

function getToken(): string | null {
  if (isServerSide()) return null
  return localStorage.getItem('accessToken')
}

function setToken(token: string): void {
  if (isServerSide()) return
  localStorage.setItem('accessToken', token)
}

function removeToken(): void {
  if (isServerSide()) return
  localStorage.removeItem('accessToken')
}

function isValidToken(token: string | null): boolean {
  if (!token) return false
  return !isTokenExpired(token)
}

function getValidToken(): string | null {
  const token = getToken()
  return isValidToken(token) ? token : null
}

const TokenManager = {
  get: getToken,
  set: setToken,
  remove: removeToken,
  isValid: isValidToken,
  getValid: getValidToken,
}

export default TokenManager
