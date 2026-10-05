import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { z } from "zod";
import { netboxApi } from "./client_api";
import { netboxConfig } from "./client_config";

vi.mock("./client_session", () => ({
  netboxSession: { authorization: null, clear: () => {} },
}));

beforeEach(() => vi.stubGlobal("window", globalThis));
afterEach(() => vi.unstubAllGlobals());

it("interrompe a listagem quando a API repete uma página", async () => {
  const next = `${netboxConfig.apiUrl}/dcim/devices/?limit=1000`;
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      Response.json({ count: 2, next, results: [{ id: 1 }] }),
    )
    .mockResolvedValue(
      Response.json({ detail: "Unexpected extra request" }, { status: 500 }),
    );
  vi.stubGlobal("fetch", fetch);

  await expect(netboxApi.list("/dcim/devices/", z.object({ id: z.number() })))
    .rejects.toThrow(/paginação/i);
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("não expõe rota nem query em erros HTTP", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json({ detail: "Equipamento não encontrado." }, { status: 404 }),
    ),
  );

  await expect(
    netboxApi.get(
      "/dcim/devices/123/?token=segredo",
      z.object({ id: z.number() }),
    ),
  ).rejects.toMatchObject({
    message: "Falha na API (HTTP 404): detail: Equipamento não encontrado.",
  });
});

it("oculta endereços devolvidos no detalhe de um erro HTTP", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json(
        { detail: "Consulte http://interno.local/api/dcim/devices/?token=segredo" },
        { status: 400 },
      ),
    ),
  );

  await expect(
    netboxApi.get("/dcim/devices/", z.object({ id: z.number() })),
  ).rejects.toMatchObject({
    message: "Falha na API (HTTP 400): detail: Consulte [endereço oculto]",
  });
});

it("não expõe servidor nem rota em falhas de conexão", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
  );

  await expect(
    netboxApi.get(
      "/dcim/devices/123/?token=segredo",
      z.object({ id: z.number() }),
    ),
  ).rejects.toMatchObject({
    message:
      "Falha de conexão: não foi possível acessar o NetBox. Verifique a rede e a configuração da API.",
  });
});

it("não expõe rota quando a requisição expira", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new DOMException("Aborted", "AbortError")),
  );

  await expect(
    netboxApi.get(
      "/dcim/devices/123/?token=segredo",
      z.object({ id: z.number() }),
    ),
  ).rejects.toMatchObject({
    message: expect.stringMatching(
      /^Tempo limite: o NetBox não respondeu em \d+ ms\.$/,
    ),
  });
});

it("não expõe rota quando a resposta não é JSON válido", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response("{", { headers: { "content-type": "application/json" } }),
    ),
  );

  await expect(
    netboxApi.get("/dcim/devices/123/", z.object({ id: z.number() })),
  ).rejects.toMatchObject({
    message:
      "Resposta ilegível da API (HTTP 200): não foi possível interpretar o corpo.",
  });
});

it("não expõe rota em falhas de validação da resposta", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json({ id: "inválido" })),
  );

  await expect(
    netboxApi.get("/dcim/devices/123/", z.object({ id: z.number() })),
  ).rejects.toMatchObject({
    message:
      'Falha de validação em resposta da API: campo "id": esperado número; recebido texto "inválido"',
  });
});

it("não expõe rota em falhas de validação do envio", () => {
  expect(() =>
    netboxApi.create(
      "/dcim/devices/",
      { width: "inválido" },
      z.object({ width: z.number() }),
      z.object({ id: z.number() }),
    ),
  ).toThrow('Falha de validação em dados enviados: campo "width"');
});
