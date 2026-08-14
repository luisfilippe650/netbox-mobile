import { z } from "zod";
import { netboxApi } from "./client_api";
import { loginInputSchema } from "./client_dto";
import { parseWithSchema } from "./client_errors";
import { netboxSession } from "./client_session";

/**
 * Fachada usada pela aplicação para autenticação e operações HTTP validadas.
 * Mantém os detalhes de transporte e armazenamento da sessão fora das telas e
 * dos services de domínio.
 */
class NetBoxClientService {
  /** Indica se há um token local disponível para autenticar requisições. */
  get isAuthenticated() {
    return netboxSession.isAuthenticated;
  }

  /**
   * Valida as credenciais antes do envio, provisiona um token e confirma a
   * identidade autenticada. Se a confirmação falhar, tenta revogar o token e
   * sempre descarta a sessão local incompleta.
   */
  async login(username: string, password: string) {
    const credentials = parseWithSchema(
      loginInputSchema,
      { username, password },
      "credenciais",
    );
    const token = await netboxApi.provisionToken(credentials);
    netboxSession.start(token);
    try {
      return await netboxApi.checkAuthentication();
    } catch (error) {
      try {
        await netboxApi.delete(`/users/tokens/${token.id}/`);
      } catch {
        // A limpeza local ainda é obrigatória se a API estiver indisponível.
      } finally {
        netboxSession.clear();
      }
      throw error;
    }
  }

  /**
   * Confirma no servidor se a sessão persistida continua válida.
   * Retorna `false` quando não há mais autenticação local; outros erros são
   * propagados para não tratar falhas de rede ou servidor como logout.
   */
  async restoreSession() {
    if (!netboxSession.isAuthenticated) return false;
    try {
      return await netboxApi.checkAuthentication();
    } catch (error) {
      if (!netboxSession.isAuthenticated) return false;
      throw error;
    }
  }

  /**
   * Revoga o token no NetBox, quando ele possui um ID, e sempre limpa a sessão
   * local, inclusive se a revogação remota falhar.
   */
  async logout() {
    const tokenId = netboxSession.tokenId;
    try {
      if (tokenId) await netboxApi.delete(`/users/tokens/${tokenId}/`);
    } finally {
      netboxSession.clear();
    }
  }

  /** Limpa apenas a sessão local, sem tentar revogar o token no servidor. */
  clearSession() {
    netboxSession.clear();
  }

  /** Lista e valida todos os itens paginados de um endpoint do NetBox. */
  list<T>(
    path: string,
    itemSchema: z.ZodType<T>,
    parameters?: Record<string, string | number | undefined>,
  ) {
    return netboxApi.list(path, itemSchema, parameters);
  }

  /** Busca um recurso e valida a resposta com o schema informado. */
  get<T>(path: string, responseSchema: z.ZodType<T>) {
    return netboxApi.get(path, responseSchema);
  }

  /** Obtém os metadados e campos aceitos por um endpoint. */
  options(path: string) {
    return netboxApi.options(path);
  }

  /** Valida o corpo, cria o recurso e valida a resposta do NetBox. */
  create<TInput, TOutput>(
    path: string,
    body: unknown,
    inputSchema: z.ZodType<TInput>,
    responseSchema: z.ZodType<TOutput>,
  ) {
    return netboxApi.create(path, body, inputSchema, responseSchema);
  }

  /** Valida o corpo, atualiza o recurso e valida a resposta do NetBox. */
  update<TInput, TOutput>(
    path: string,
    body: unknown,
    inputSchema: z.ZodType<TInput>,
    responseSchema: z.ZodType<TOutput>,
  ) {
    return netboxApi.update(path, body, inputSchema, responseSchema);
  }

  /** Remove o recurso identificado pelo caminho informado. */
  delete(path: string) {
    return netboxApi.delete(path);
  }
}

export const netboxClient = new NetBoxClientService();
