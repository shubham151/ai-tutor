interface RequestConfig extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown> | string
}

function createHeaders(token?: string | null, additionalHeaders?: HeadersInit): Headers {
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...additionalHeaders,
  })

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return headers
}

function prepareRequestBody(body?: Record<string, unknown> | string): string | undefined {
  if (!body) return undefined
  return typeof body === 'string' ? body : JSON.stringify(body)
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(errorData.error || `HTTP ${response.status}`)
  }

  return response.json()
}

async function makeRequest<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const token = getAuthToken()
  const requestConfig = {
    ...config,
    headers: createHeaders(token, config.headers),
    body: prepareRequestBody(config.body),
  }

  const response = await fetch(endpoint, requestConfig)

  if (response.status === 401) {
    const refreshed = await refreshAuthToken()
    if (!refreshed) {
      removeAuthToken()
      throw new Error('Authentication required')
    }

    const newToken = getAuthToken()
    const retryConfig = {
      ...config,
      headers: createHeaders(newToken, config.headers),
      body: prepareRequestBody(config.body),
    }

    const retryResponse = await fetch(endpoint, retryConfig)
    return handleResponse<T>(retryResponse)
  }

  return handleResponse<T>(response)
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('accessToken', token)
}

function removeAuthToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('accessToken')
}

async function refreshAuthToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })

    if (response.ok) {
      const data = await response.json()
      if (data.accessToken) {
        setAuthToken(data.accessToken)
        return true
      }
    }
    return false
  } catch {
    return false
  }
}

function get<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<T> {
  return makeRequest<T>(endpoint, { ...config, method: 'GET' })
}

function post<T>(
  endpoint: string,
  body?: Record<string, unknown>,
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<T> {
  return makeRequest<T>(endpoint, { ...config, method: 'POST', body })
}

function put<T>(
  endpoint: string,
  body?: Record<string, unknown>,
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<T> {
  return makeRequest<T>(endpoint, { ...config, method: 'PUT', body })
}

function patch<T>(
  endpoint: string,
  body?: Record<string, unknown>,
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<T> {
  return makeRequest<T>(endpoint, { ...config, method: 'PATCH', body })
}

function del<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<T> {
  return makeRequest<T>(endpoint, { ...config, method: 'DELETE' })
}

const Api = {
  get,
  post,
  put,
  patch,
  delete: del,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  refreshAuthToken,
}

export default Api
