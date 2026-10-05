import { Capacitor, registerPlugin } from "@capacitor/core";
import { tokenSchema, type NetBoxToken } from "./client_dto";

type SecureSessionPlugin = {
  load(): Promise<{ value?: string }>;
  save(options: { value: string }): Promise<void>;
  clear(): Promise<void>;
};

const secureSession = registerPlugin<SecureSessionPlugin>("SecureSession");
const usesAndroidKeystore = Capacitor.getPlatform() === "android";

function authorizationFor(token: NetBoxToken) {
  return token.version === 2
    ? `Bearer nbt_${token.key}.${token.token}`
    : `Token ${token.token}`;
}

class NetBoxSession {
  private token: NetBoxToken | null = null;

  get isAuthenticated() {
    return this.token !== null;
  }

  get tokenId() {
    return this.token?.id;
  }

  get authorization() {
    return this.token ? authorizationFor(this.token) : null;
  }

  async restore() {
    this.token = null;
    if (!usesAndroidKeystore) return;

    const { value } = await secureSession.load();
    if (!value) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      await secureSession.clear();
      return;
    }
    const result = tokenSchema.safeParse(parsed);
    if (!result.success) {
      await secureSession.clear();
      return;
    }
    this.token = result.data;
  }

  async start(token: NetBoxToken) {
    this.token = token;
    if (usesAndroidKeystore) {
      await secureSession.save({ value: JSON.stringify(token) });
    }
  }

  async clear() {
    this.token = null;
    if (usesAndroidKeystore) await secureSession.clear();
  }
}

export const netboxSession = new NetBoxSession();
