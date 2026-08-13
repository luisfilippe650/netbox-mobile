import type { z } from 'zod'
import { tokenSchema } from './schemas'

export type NetBoxToken = z.infer<typeof tokenSchema>

const sessionKey = 'netbox-mobile.session'

export function readStoredToken(): NetBoxToken | null {
  try {
    const value = sessionStorage.getItem(sessionKey)
    if (!value) return null
    const result = tokenSchema.safeParse(JSON.parse(value))
    if (!result.success) sessionStorage.removeItem(sessionKey)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export function storeToken(token: NetBoxToken) {
  sessionStorage.setItem(sessionKey, JSON.stringify(token))
}

export function removeStoredToken() {
  sessionStorage.removeItem(sessionKey)
}

export function authorizationFor(token: NetBoxToken) {
  return token.version === 2
    ? `Bearer nbt_${token.key}.${token.token}`
    : `Token ${token.token}`
}
