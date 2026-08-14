import { z } from 'zod'
import { netboxApi } from './client_api'
import { loginInputSchema } from './client_dto'
import { parseWithSchema } from './client_errors'
import { netboxSession } from './client_session'

class NetBoxClientService {
  get isAuthenticated() {
    return netboxSession.isAuthenticated
  }

  async login(username: string, password: string) {
    const credentials = parseWithSchema(loginInputSchema, { username, password }, 'credenciais')
    const token = await netboxApi.provisionToken(credentials)
    netboxSession.start(token)
    return netboxApi.checkAuthentication()
  }

  async restoreSession() {
    if (!netboxSession.isAuthenticated) return false
    try {
      return await netboxApi.checkAuthentication()
    } catch (error) {
      if (!netboxSession.isAuthenticated) return false
      throw error
    }
  }

  async logout() {
    const tokenId = netboxSession.tokenId
    try {
      if (tokenId) await netboxApi.delete(`/users/tokens/${tokenId}/`)
    } finally {
      netboxSession.clear()
    }
  }

  clearSession() {
    netboxSession.clear()
  }

  list<T>(path: string, itemSchema: z.ZodType<T>, parameters?: Record<string, string | number | undefined>) {
    return netboxApi.list(path, itemSchema, parameters)
  }

  get<T>(path: string, responseSchema: z.ZodType<T>) {
    return netboxApi.get(path, responseSchema)
  }

  options(path: string) {
    return netboxApi.options(path)
  }

  create<TInput, TOutput>(path: string, body: unknown, inputSchema: z.ZodType<TInput>, responseSchema: z.ZodType<TOutput>) {
    return netboxApi.create(path, body, inputSchema, responseSchema)
  }

  update<TInput, TOutput>(path: string, body: unknown, inputSchema: z.ZodType<TInput>, responseSchema: z.ZodType<TOutput>) {
    return netboxApi.update(path, body, inputSchema, responseSchema)
  }

  delete(path: string) {
    return netboxApi.delete(path)
  }
}

export const netboxClient = new NetBoxClientService()
