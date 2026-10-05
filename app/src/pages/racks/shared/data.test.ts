import { describe, expect, it } from "vitest";
import type { RackSummary } from "./data";
import {
  getOccupiedUnits,
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
  it("conta uma unidade uma vez quando frente e traseira a compartilham", () => {
    const device = {
      apiId: 1,
      name: "Equipamento",
      role: "Rede",
      startingUnit: 10,
      height: 1,
      status: "Ativo",
    };
    expect(
      getOccupiedUnits({
        ...rack,
        devices: [
          { ...device, id: "front", face: "front" },
          { ...device, id: "rear", face: "rear" },
        ],
      }),
    ).toBe(1);
  });

  it("desconsidera a altura que fica fora do rack", () => {
    expect(
      getOccupiedUnits({
        ...rack,
        height: 10,
        devices: [
          {
            id: "partial",
            apiId: 3,
            name: "Equipamento",
            role: "Rede",
            startingUnit: 9,
            height: 4,
            status: "Ativo",
          },
        ],
      }),
    ).toBe(2);
  });

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
  it("permite visualizar e selecionar equipamentos da face traseira", () => {
    const positioned = getPositionedRackDevices(
      {
        ...rack,
        devices: [
          {
            id: "rear",
            apiId: 2,
            name: "Patch panel traseiro",
            role: "Rede",
            startingUnit: 10,
            height: 1,
            status: "Ativo",
            face: "rear",
          },
        ],
      },
      "rear",
    );
    expect(positioned).toMatchObject([{ id: "rear", row: 31 }]);
  });

  it("não desenha equipamentos traseiros na elevação frontal", () => {
    const positioned = getPositionedRackDevices({
      ...rack,
      devices: [
        {
          id: "rear",
          apiId: 2,
          name: "Patch panel traseiro",
          role: "Rede",
          startingUnit: 10,
          height: 1,
          status: "Ativo",
          face: "rear",
        },
      ],
    });
    expect(positioned).toEqual([]);
  });

  it("desenha na frente um equipamento traseiro de profundidade total", () => {
    const positioned = getPositionedRackDevices({
      ...rack,
      devices: [
        {
          id: "full-depth",
          apiId: 4,
          name: "Servidor",
          role: "Servidor",
          startingUnit: 10,
          height: 1,
          status: "Ativo",
          face: "rear",
          fullDepth: true,
        },
      ],
    });
    expect(positioned).toHaveLength(1);
  });

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
