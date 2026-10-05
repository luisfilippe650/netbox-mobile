import { beforeEach, describe, expect, it, vi } from "vitest";
import { devicesApi } from "./devices_api";

const client = vi.hoisted(() => ({
  list: vi.fn(),
}));

vi.mock("../client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../client")>()),
  netboxClient: client,
}));

describe("devices API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lista somente IPv4s associados ao dispositivo", async () => {
    client.list.mockResolvedValue([
      { id: 33, display: "192.0.2.10/24", address: "192.0.2.10/24" },
    ]);

    const api = devicesApi as typeof devicesApi & {
      listIpAddresses?: (deviceId: number) => Promise<unknown>;
    };
    const result = await api.listIpAddresses?.(10);

    expect(client.list).toHaveBeenCalledWith(
      "/ipam/ip-addresses/",
      expect.anything(),
      { device_id: 10, family: 4 },
    );
    expect(result).toEqual([
      { id: 33, display: "192.0.2.10/24", address: "192.0.2.10/24" },
    ]);
  });
});
