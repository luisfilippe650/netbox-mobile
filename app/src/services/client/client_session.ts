import { tokenSchema, type NetBoxToken } from './client_dto'

const sessionKey = 'netbox-mobile.session'

function readStoredToken(): NetBoxToken | null {
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

function authorizationFor(token: NetBoxToken) {
  return token.version === 2
    ? `Bearer nbt_${token.key}.${token.token}`
    : `Token ${token.token}`
}

class NetBoxSession {
  private token = readStoredToken()

  get isAuthenticated() {
    return this.token !== null
  }

  get tokenId() {
    return this.token?.id
  }

  get authorization() {
    return this.token ? authorizationFor(this.token) : null
  }

  start(token: NetBoxToken) {
    this.token = token
    sessionStorage.setItem(sessionKey, JSON.stringify(token))
  }

  clear() {
    this.token = null
    sessionStorage.removeItem(sessionKey)
  }
}

export const netboxSession = new NetBoxSession()
