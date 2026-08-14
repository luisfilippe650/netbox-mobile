import { z } from "zod";
import { netboxConfig } from "./client_config";
import {
  authenticationCheckSchema,
  emptyResponseSchema,
  paginatedSchema,
  tokenSchema,
  type LoginDto,
  type NetBoxToken,
} from "./client_dto";
import {
  apiErrorMessage,
  NetBoxApiError,
  parseWithSchema,
} from "./client_errors";
import { netboxSession } from "./client_session";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  authenticated?: boolean;
};

class NetBoxApiClient {
  private async request<T>(
    path: string,
    options: RequestOptions = {},
    responseSchema?: z.ZodType<T>,
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      netboxConfig.requestTimeoutMs,
    );
    const url =
      path.startsWith("http://") || path.startsWith("https://")
        ? path
        : `${netboxConfig.apiUrl}${path.startsWith("/") ? path : `/${path}`}`;

    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    if (options.body !== undefined)
      headers.set("Content-Type", "application/json");
    if (options.authenticated !== false && netboxSession.authorization) {
      headers.set("Authorization", netboxSession.authorization);
    }

    try {
      const response = await fetch(url, {
        ...options,
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
        headers,
        signal: controller.signal,
      });

      const contentType = response.headers.get("content-type") ?? "";
      const payload: unknown =
        response.status === 204
          ? null
          : contentType.includes("json")
            ? await response.json()
            : await response.text();

      if (!response.ok) {
        const invalidAuthentication =
          response.status === 401 ||
          (response.status === 403 &&
            /invalid (v1|v2) token|authentication credentials/i.test(
              JSON.stringify(payload),
            ));
        if (invalidAuthentication && options.authenticated !== false)
          netboxSession.clear();
        throw new NetBoxApiError(
          apiErrorMessage(
            payload,
            `A API respondeu com status ${response.status}.`,
          ),
          response.status,
          payload,
        );
      }

      return responseSchema
        ? parseWithSchema(responseSchema, payload, `resposta de ${path}`)
        : (payload as T);
    } catch (error) {
      if (error instanceof NetBoxApiError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new NetBoxApiError(
          "A conexão com o NetBox excedeu o tempo limite.",
          0,
        );
      }
      throw new NetBoxApiError(
        "Não foi possível conectar ao NetBox. Verifique o endereço da API e a rede.",
        0,
        error,
      );
    } finally {
      window.clearTimeout(timeout);
    }
  }

  provisionToken(credentials: LoginDto) {
    return this.request<NetBoxToken>(
      "/users/tokens/provision/",
      {
        method: "POST",
        authenticated: false,
        body: {
          ...credentials,
          version: 2,
          write_enabled: true,
          description: "NetBox Mobile",
        },
      },
      tokenSchema,
    );
  }

  checkAuthentication() {
    return this.request(
      "/authentication-check/",
      {},
      authenticationCheckSchema,
    );
  }

  options(path: string) {
    return this.request<Record<string, unknown>>(path, { method: "OPTIONS" });
  }

  async list<T>(
    path: string,
    itemSchema: z.ZodType<T>,
    parameters: Record<string, string | number | undefined> = {},
  ) {
    const query = new URLSearchParams();
    Object.entries({ limit: 1000, ...parameters }).forEach(([key, value]) => {
      if (value !== undefined && String(value) !== "")
        query.set(key, String(value));
    });

    let next: string | null = `${path}?${query.toString()}`;
    const results: T[] = [];
    while (next) {
      const page: { count: number; next: string | null; results: T[] } =
        await this.request(next, {}, paginatedSchema(itemSchema));
      results.push(...page.results);
      next = page.next;
    }
    return results;
  }

  get<T>(path: string, responseSchema: z.ZodType<T>) {
    return this.request<T>(path, {}, responseSchema);
  }

  create<TInput, TOutput>(
    path: string,
    body: unknown,
    inputSchema: z.ZodType<TInput>,
    responseSchema: z.ZodType<TOutput>,
  ) {
    const parsedBody = parseWithSchema(inputSchema, body, `envio para ${path}`);
    return this.request<TOutput>(
      path,
      { method: "POST", body: parsedBody },
      responseSchema,
    );
  }

  update<TInput, TOutput>(
    path: string,
    body: unknown,
    inputSchema: z.ZodType<TInput>,
    responseSchema: z.ZodType<TOutput>,
  ) {
    const parsedBody = parseWithSchema(
      inputSchema,
      body,
      `atualização de ${path}`,
    );
    return this.request<TOutput>(
      path,
      { method: "PATCH", body: parsedBody },
      responseSchema,
    );
  }

  delete(path: string) {
    return this.request<null>(path, { method: "DELETE" }, emptyResponseSchema);
  }
}

export const netboxApi = new NetBoxApiClient();
