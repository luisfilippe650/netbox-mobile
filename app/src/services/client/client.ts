import { netboxConfig } from './config'
import { z } from 'zod'
import { apiErrorMessage, NetBoxApiError, parseWithSchema } from './errors'
import { authorizationFor, readStoredToken, removeStoredToken, storeToken, type NetBoxToken } from './session'
import { authenticationCheckSchema, emptyResponseSchema, loginInputSchema, paginatedSchema, tokenSchema } from './schemas'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  authenticated?: boolean
}

class NetBoxClient {
  private token = readStoredToken()

  get isAuthenticated() {
    return this.token !== null
  }

  private async request<T>(path: string, options: RequestOptions = {}, responseSchema?: z.ZodType<T>): Promise<T> {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), netboxConfig.requestTimeoutMs)
    const url = path.startsWith('http://') || path.startsWith('https://')
      ? path
      : `${netboxConfig.apiUrl}${path.startsWith('/') ? path : `/${path}`}`

    const headers = new Headers(options.headers)
    headers.set('Accept', 'application/json')
    if (options.body !== undefined) headers.set('Content-Type', 'application/json')
    if (options.authenticated !== false && this.token) {
      headers.set('Authorization', authorizationFor(this.token))
    }

    try {
      const response = await fetch(url, {
        ...options,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        headers,
        signal: controller.signal,
      })

      const contentType = response.headers.get('content-type') ?? ''
      const payload: unknown = response.status === 204
        ? null
        : contentType.includes('json')
          ? await response.json()
          : await response.text()

      if (!response.ok) {
        const invalidAuthentication = response.status === 401
          || (response.status === 403 && /invalid (v1|v2) token|authentication credentials/i.test(JSON.stringify(payload)))
        if (invalidAuthentication && options.authenticated !== false) this.clearSession()
        throw new NetBoxApiError(
          apiErrorMessage(payload, `A API respondeu com status ${response.status}.`),
          response.status,
          payload,
        )
      }

      return responseSchema ? parseWithSchema(responseSchema, payload, `resposta de ${path}`) : payload as T
    } catch (error) {
      if (error instanceof NetBoxApiError) throw error
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new NetBoxApiError('A conexão com o NetBox excedeu o tempo limite.', 0)
      }
      throw new NetBoxApiError('Não foi possível conectar ao NetBox. Verifique o endereço da API e a rede.', 0, error)
    } finally {
      window.clearTimeout(timeout)
    }
  }

  async login(username: string, password: string) {
    const credentials = parseWithSchema(loginInputSchema, { username, password }, 'credenciais')
    const token = await this.request<NetBoxToken>('/users/tokens/provision/', {
      method: 'POST',
      authenticated: false,
      body: {
        ...credentials,
        version: 2,
        write_enabled: true,
        description: 'NetBox Mobile',
      },
    }, tokenSchema)
    this.token = token
    storeToken(token)
  }

  async restoreSession() {
    if (!this.token) return false
    try {
      await this.request('/authentication-check/', {}, authenticationCheckSchema)
      return true
    } catch (error) {
      if (!this.token) return false
      throw error
    }
  }

  async logout() {
    const tokenId = this.token?.id
    try {
      if (tokenId) await this.delete(`/users/tokens/${tokenId}/`)
    } finally {
      this.clearSession()
    }
  }

  clearSession() {
    this.token = null
    removeStoredToken()
  }

  async list<T>(path: string, itemSchema: z.ZodType<T>, parameters: Record<string, string | number | undefined> = {}) {
    const query = new URLSearchParams()
    Object.entries({ limit: 1000, ...parameters }).forEach(([key, value]) => {
      if (value !== undefined && String(value) !== '') query.set(key, String(value))
    })

    let next: string | null = `${path}?${query.toString()}`
    const results: T[] = []
    while (next) {
      const page: { count: number; next: string | null; results: T[] } = await this.request(
        next,
        {},
        paginatedSchema(itemSchema),
      )
      results.push(...page.results)
      next = page.next
    }
    return results
  }

  get<T>(path: string, responseSchema: z.ZodType<T>) {
    return this.request<T>(path, {}, responseSchema)
  }

  create<TInput, TOutput>(path: string, body: unknown, inputSchema: z.ZodType<TInput>, responseSchema: z.ZodType<TOutput>) {
    const parsedBody = parseWithSchema(inputSchema, body, `envio para ${path}`)
    return this.request<TOutput>(path, { method: 'POST', body: parsedBody }, responseSchema)
  }

  update<TInput, TOutput>(path: string, body: unknown, inputSchema: z.ZodType<TInput>, responseSchema: z.ZodType<TOutput>) {
    const parsedBody = parseWithSchema(inputSchema, body, `atualização de ${path}`)
    return this.request<TOutput>(path, { method: 'PATCH', body: parsedBody }, responseSchema)
  }

  delete(path: string) {
    return this.request<null>(path, { method: 'DELETE' }, emptyResponseSchema)
  }
}

export const netboxClient = new NetBoxClient()

export { NetBoxApiError } from './errors'
