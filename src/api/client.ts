const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const REQUEST_TIMEOUT_MS = 10_000

export class ApiError extends Error {
  readonly status: number
  readonly retryAfter: string | null
  readonly body: unknown

  constructor(status: number, retryAfter: string | null, body: unknown) {
    super(`API request failed with status ${status}`)
    this.status = status
    this.retryAfter = retryAfter
    this.body = body
  }
}

export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('Network request failed', { cause })
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown }

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, signal, ...rest } = options

  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS)
  signal?.addEventListener('abort', () => timeoutController.abort(), { once: true })

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      credentials: 'include',
      signal: timeoutController.signal,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    throw new NetworkError(error)
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new ApiError(response.status, response.headers.get('Retry-After'), errorBody)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
}
