import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  deviceSchema,
  deviceTypeSchema,
  deviceUpdateSchema,
} from "./devices_dto";

let mapDevice: (typeof import("./devices_service"))["mapDevice"];

beforeAll(async () => {
  vi.stubGlobal("sessionStorage", {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  });
  ({ mapDevice } = await import("./devices_service"));
});

const device = deviceSchema.parse({
  id: 10,
  display: "Servidor 01",
  name: "Servidor 01",
  device_type: { id: 7, display: "Servidor 2U", model: "Servidor 2U" },
  role: { id: 1, display: "Servidor", name: "Servidor" },
  site: { id: 1, display: "INPE", name: "INPE", region: null },
  location: null,
  rack: { id: 5, display: "Rack 01", name: "Rack 01" },
  position: 10,
  status: { value: "active", label: "Active" },
  serial: "",
  asset_tag: null,
  description: "",
  custom_fields: {},
});

const deviceType = deviceTypeSchema.parse({
  id: 7,
  display: "Servidor 2U",
  model: "Servidor 2U",
  slug: "servidor-2u",
  manufacturer: { id: 1, display: "Fabricante", name: "Fabricante" },
  u_height: 2,
  description: "",
  device_count: 1,
});

describe("mapDevice", () => {
  it("usa a altura real do catálogo de tipos de equipamento", () => {
    expect(mapDevice(device, deviceType).height).toBe(2);
  });

  it("preserva a face traseira devolvida pelo NetBox", () => {
    const rearDevice = deviceSchema.parse({
      ...device,
      face: { value: "rear", label: "Rear" },
    });
    expect(mapDevice(rearDevice).face).toBe("rear");
  });

  it("preserva se o tipo de equipamento ocupa as duas faces", () => {
    expect(
      mapDevice(
        device,
        deviceTypeSchema.parse({ ...deviceType, is_full_depth: true }),
      ).fullDepth,
    ).toBe(true);
  });

  it("preserva o identificador do IPv4 primário para permitir sua edição", () => {
    const deviceWithPrimaryIp4 = deviceSchema.parse({
      ...device,
      primary_ip4: {
        id: 33,
        display: "192.0.2.10/24",
        address: "192.0.2.10/24",
      },
    });

    expect(mapDevice(deviceWithPrimaryIp4).primaryIp4Id).toBe(33);
  });
});

describe("deviceUpdateSchema", () => {
  it("mantém o ID do IPv4 primário no payload de atualização", () => {
    const parsed = deviceUpdateSchema.parse({
      location: null,
      rack: null,
      primary_ip4: 33,
    });

    expect(parsed.primary_ip4).toBe(33);
  });
});
