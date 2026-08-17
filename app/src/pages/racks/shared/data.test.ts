import { describe, expect, it } from "vitest";
import type { RackSummary } from "./data";
import {
  getPositionedRackDevices,
  getRackOccupancyPercentage,
} from "./data";

const rack: RackSummary = {
  id: "rack-1",
  apiId: 1,
  name: "Rack 1",
  site: "INPE",
  location: "Sala 1",
  group: "Sem grupo",
  role: "Produção",
  height: 40,
  startingUnit: 1,
  width: 19,
  devices: [],
};

describe("getRackOccupancyPercentage", () => {
  it("retorna zero para um rack vazio", () => {
    expect(getRackOccupancyPercentage(rack)).toBe(0);
  });

  it("arredonda a porcentagem de unidades ocupadas", () => {
    expect(
      getRackOccupancyPercentage({
        ...rack,
        devices: [
          {
            id: "device-1",
            apiId: 1,
            name: "Servidor",
            role: "Servidor",
            startingUnit: 1,
            height: 13,
            status: "Ativo",
          },
        ],
      }),
    ).toBe(33);
  });

  it("limita a ocupação exibida a 100%", () => {
    expect(
      getRackOccupancyPercentage({
        ...rack,
        devices: [
          {
            id: "device-1",
            apiId: 1,
            name: "Dados inconsistentes",
            role: "Servidor",
            startingUnit: 1,
            height: 50,
            status: "Ativo",
          },
        ],
      }),
    ).toBe(100);
  });
});

describe("getPositionedRackDevices", () => {
  it("faz um equipamento de 2U ocupar exatamente duas linhas", () => {
    const positioned = getPositionedRackDevices({
      ...rack,
      devices: [
        {
          id: "device-1",
          apiId: 1,
          name: "Servidor 2U",
          role: "Servidor",
          startingUnit: 10,
          height: 2,
          status: "Ativo",
        },
      ],
    });

    expect(positioned[0]).toMatchObject({
      firstVisibleUnit: 10,
      lastVisibleUnit: 11,
      row: 30,
      visibleHeight: 2,
    });
  });

  it("considera a unidade inicial configurada no rack", () => {
    const positioned = getPositionedRackDevices({
      ...rack,
      height: 10,
      startingUnit: 5,
      devices: [
        {
          id: "device-1",
          apiId: 1,
          name: "Servidor 2U",
          role: "Servidor",
          startingUnit: 5,
          height: 2,
          status: "Ativo",
        },
      ],
    });

    expect(positioned[0]).toMatchObject({ row: 9, visibleHeight: 2 });
  });
});
