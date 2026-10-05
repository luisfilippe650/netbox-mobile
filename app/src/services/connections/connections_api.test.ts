import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cableCreateSchema,
  cableSchema,
  traceResponseSchema,
} from "./connections_dto";
import { connectionsApi } from "./connections_api";
import { NetBoxApiError } from "../client";

const client = vi.hoisted(() => ({
  page: vi.fn(),
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  options: vi.fn(),
}));

vi.mock("../client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../client")>()),
  netboxClient: client,
}));

const device = { id: 10, display: "Servidor 01", name: "Servidor 01" };
const interfaceTermination = {
  id: 101,
  url: "http://netbox/api/dcim/interfaces/101/",
  display: "eth0",
  device,
  name: "eth0",
  cable: 42,
  _occupied: true,
};
const rearTermination = {
  id: 201,
  url: "http://netbox/api/dcim/rear-ports/201/",
  display: "Rear 01",
  device: { id: 20, display: "Patch panel", name: "Patch panel" },
  name: "Rear 01",
  cable: 42,
  _occupied: true,
};
const tracedCable = {
  id: 42,
  url: "http://netbox/api/dcim/cables/42/",
  display_url: "http://netbox/dcim/cables/42/",
  type: { value: "cat6a", label: "CAT6a" },
  status: { value: "connected", label: "Connected" },
  label: "SRV01-PP01",
  color: "2196f3",
  length: 12.5,
  length_unit: { value: "m", label: "Meters" },
  description: "Trecho A",
};

describe("connection DTOs", () => {
  it("rejeita criação sem as duas terminações", () => {
    expect(() => cableCreateSchema.parse({ status: "connected" })).toThrow();
  });

  it("aceita o cabo genérico devolvido pela API 4.6", () => {
    const parsed = cableSchema.parse({
      id: 42,
      url: "http://netbox/api/dcim/cables/42/",
      display_url: "http://netbox/dcim/cables/42/",
      display: "SRV01-PP01",
      type: { value: "cat6a", label: "CAT6a" },
      a_terminations: [
        { object_type: "dcim.interface", object_id: 101, object: interfaceTermination },
      ],
      b_terminations: [
        { object_type: "dcim.rearport", object_id: 201, object: rearTermination },
      ],
      status: { value: "connected", label: "Connected" },
      profile: null,
      label: "SRV01-PP01",
      color: "2196f3",
      length: 12.5,
      length_unit: { value: "m", label: "Meters" },
      description: "Trecho A",
    });

    expect(parsed.b_terminations[0].object_id).toBe(201);
  });

  it("aceita o formato efetivo de trace em triplas", () => {
    const parsed = traceResponseSchema.parse([
      [[interfaceTermination], tracedCable, [rearTermination]],
    ]);

    expect(parsed[0][1]?.id).toBe(42);
  });

  it("normaliza o status textual devolvido pelo serializer aninhado do trace", () => {
    const parsed = traceResponseSchema.parse([
      [
        [interfaceTermination],
        { ...tracedCable, status: "connected" },
        [rearTermination],
      ],
    ]);

    expect(parsed[0][1]?.status).toEqual({
      value: "connected",
      label: "Connected",
    });
  });

  it("rejeita a forma Interface incorretamente anunciada pelo OpenAPI", () => {
    expect(() => traceResponseSchema.parse(interfaceTermination)).toThrow();
  });
});

describe("connections API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("pagina cabos usando os filtros recebidos", async () => {
    client.page.mockResolvedValue({ count: 0, results: [] });

    await connectionsApi.page({ limit: 25, offset: 0, q: "SRV01" });

    expect(client.page).toHaveBeenCalledWith("/dcim/cables/", cableSchema, {
      limit: 25,
      offset: 0,
      q: "SRV01",
    });
  });

  it("consulta somente terminações físicas disponíveis para seleção", async () => {
    client.list.mockResolvedValue([]);

    await connectionsApi.listDeviceTerminations(10, true);

    expect(client.list).toHaveBeenNthCalledWith(
      1,
      "/dcim/interfaces/",
      expect.anything(),
      { device_id: 10, kind: "physical", occupied: false },
    );
    expect(client.list).toHaveBeenNthCalledWith(
      2,
      "/dcim/front-ports/",
      expect.anything(),
      { device_id: 10, occupied: false },
    );
    expect(client.list).toHaveBeenNthCalledWith(
      3,
      "/dcim/rear-ports/",
      expect.anything(),
      { device_id: 10, occupied: false },
    );
  });

  it("mantém terminações autorizadas quando um tipo retorna 403", async () => {
    client.list
      .mockResolvedValueOnce([interfaceTermination])
      .mockRejectedValueOnce(new NetBoxApiError("Sem permissão", 403))
      .mockResolvedValueOnce([rearTermination]);

    const result = await connectionsApi.listDeviceTerminations(10);

    expect(result.map((item) => item.kind)).toEqual([
      "dcim.interface",
      "dcim.rearport",
    ]);
  });

  it("propaga falhas que não são recusa de permissão", async () => {
    client.list
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new NetBoxApiError("Servidor indisponível", 500))
      .mockResolvedValueOnce([]);

    await expect(connectionsApi.listDeviceTerminations(10)).rejects.toThrow(
      "Servidor indisponível",
    );
  });

  it("cria e exclui pelo contrato e ID exatos", async () => {
    const payload = {
      a_terminations: [{ object_type: "dcim.interface" as const, object_id: 101 }],
      b_terminations: [{ object_type: "dcim.rearport" as const, object_id: 201 }],
      status: "connected" as const,
    };
    client.create.mockResolvedValue({ id: 42 });
    client.delete.mockResolvedValue(null);

    await connectionsApi.create(payload);
    await connectionsApi.delete(42);

    expect(client.create).toHaveBeenCalledWith(
      "/dcim/cables/",
      payload,
      cableCreateSchema,
      cableSchema,
    );
    expect(client.delete).toHaveBeenCalledWith("/dcim/cables/42/");
  });
});
