const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const REQUEST_TIMEOUT_MS = 10_000

// 백엔드의 모든 응답이 통과하는 공통 봉투 (fm-backend ResponseEnvelope)
interface ApiEnvelope<T> {
  code: string
  message: string
  data: T
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string | null
  readonly retryAfter: string | null
  readonly body: unknown

  constructor(status: number, code: string | null, retryAfter: string | null, body: unknown) {
    super(`API request failed with status ${status}`)
    this.status = status
    this.code = code
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

  if (response.status === 204) {
    if (!response.ok) {
      throw new ApiError(response.status, null, response.headers.get('Retry-After'), null)
    }
    return undefined as T
  }

  const envelope = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok) {
    throw new ApiError(
      response.status,
      envelope?.code ?? null,
      response.headers.get('Retry-After'),
      envelope,
    )
  }

  return envelope?.data as T
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
}
