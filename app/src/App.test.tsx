// @vitest-environment jsdom
import { beforeEach as setUpLanguage } from "vitest";
import { setLanguage } from "./i18n/language";
setUpLanguage(() => setLanguage("pt"));
import { act, useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { DeviceSummary } from "./services/view_models";
import { AccessProvider } from "./context/AccessContext";
import App from "./App";

const fixtures = vi.hoisted(() => {
  const device = {
    id: 10,
    display: "Servidor 01",
    name: "Servidor 01",
    device_type: { id: 7, display: "Servidor 2U", model: "Servidor 2U" },
    role: { id: 1, display: "Servidor", name: "Servidor" },
    site: { id: 1, display: "INPE", name: "INPE", region: null },
    location: null,
    rack: { id: 5, display: "Rack 01", name: "Rack 01" },
    position: 10,
    face: { value: "rear", label: "Rear" },
    status: { value: "active", label: "Active" },
    serial: "",
    asset_tag: null,
    description: "",
    custom_fields: {},
  };
  const deviceType = {
    id: 7,
    display: "Servidor 2U",
    model: "Servidor 2U",
    slug: "servidor-2u",
    manufacturer: { id: 1, display: "Fabricante", name: "Fabricante" },
    u_height: 2,
    is_full_depth: true,
    description: "Tipo de 2U",
    device_count: 1,
  };
  const rack = {
    id: 5,
    display: "Rack 01",
    name: "Rack 01",
    site: { id: 1, display: "INPE", name: "INPE" },
    location: null,
    group: null,
    role: null,
    width: 19,
    u_height: 42,
    starting_unit: 1,
    description: "",
    status: { value: "active", label: "Active" },
    device_count: 1,
  };
  const updateDevice = vi.fn(async (_id: number, _body: unknown) => ({
    ...device,
    primary_ip4: {
      id: 34,
      display: "192.0.2.11/24",
      address: "192.0.2.11/24",
    },
  }));
  return {
    device,
    deviceType,
    rack,
    createRack: vi.fn(),
    updateDevice,
    pageDevices: vi.fn(async (_parameters: unknown) => ({ count: 1, results: [device] })),
    failRackData: false,
  };
});

vi.mock("./services", async (importOriginal) => {
  const original = await importOriginal<typeof import("./services")>();
  return {
    ...original,
    netboxClient: {
      login: vi.fn(),
      restoreSession: async () => ({
        id: 1,
        username: "admin",
        display: "Admin",
        groups: [],
        permissions: [],
      }),
      options: async () => ({ actions: { POST: {} } }),
    },
    loadNetBoxData: async (keys: string[]) => {
      if (fixtures.failRackData && keys.includes("devices"))
        throw new Error("Falha ao carregar equipamentos");
      return Object.fromEntries(
        keys.map((key) => [
          key,
          key === "devices"
            ? [fixtures.device]
            : key === "deviceTypes"
              ? [fixtures.deviceType]
              : [],
        ]),
      );
    },
    netbox: {
      devices: {
        page: fixtures.pageDevices,
        list: async () => [fixtures.device],
        update: fixtures.updateDevice,
      },
      customFields: { listForDevices: async () => [] },
      racks: {
        create: fixtures.createRack,
        page: async () => ({ count: 1, results: [fixtures.rack] }),
      },
    },
  };
});

vi.mock("./pages/home/Home", () => ({
  default: ({
    onOpenPage,
    searchDevices,
    onSelectDevice,
  }: {
    onOpenPage: (page: "add-rack" | "rack-info" | "connections") => void;
    searchDevices: (by: "name" | "asset_tag", query: string) => Promise<DeviceSummary[]>;
    onSelectDevice: (device: DeviceSummary) => void;
  }) => (
    <>
      <button onClick={() => onOpenPage("add-rack")}>Adicionar rack</button>
      <button onClick={() => onOpenPage("rack-info")}>Visualizar racks</button>
      <button onClick={() => onOpenPage("connections")}>Abrir conexões</button>
      <button onClick={() => void searchDevices("asset_tag", "ST-ABC123")}>Buscar Service Tag</button>
      <button
        onClick={async () =>
          onSelectDevice((await searchDevices("name", "Servidor"))[0])
        }
      >
        Abrir equipamento
      </button>
    </>
  ),
}));

vi.mock("./pages/connections/Connections/Connections", () => ({
  default: ({ onBack }: { onBack: () => void }) => <><p>Lista de conexões</p><button onClick={onBack}>Voltar das conexões</button></>,
}));

vi.mock("./pages/racks/AddRack/AddRack", () => ({
  default: ({ onCreate, onBack }: { onCreate: (input: object) => Promise<void>; onBack: () => void }) => (
    <><button onClick={onBack}>Voltar do cadastro</button><button
      onClick={() =>
        void onCreate({
          name: "Novo rack",
          siteId: 1,
          locationId: null,
          groupId: null,
          roleId: null,
          width: 19,
          height: 42,
          startingUnit: 1,
          description: "",
        })
      }
    >
      Criar rack
    </button></>
  ),
}));

vi.mock("./pages/racks/RackInfo/RackInfo", async () => {
  const { getOccupiedUnits } = await import("./pages/racks/shared/data");
  type RackSummary = import("./pages/racks/shared/data").RackSummary;
  type Page = { results: RackSummary[] };
  function RackInfoMock({
    loadPage,
    onSelect,
    onAdd,
  }: {
    loadPage: (request: { limit: number; offset: number }) => Promise<Page>;
    onSelect: (rack: RackSummary) => void;
    onAdd: () => void;
  }) {
    const [rack, setRack] = useState<RackSummary | null>(null);
    useEffect(() => {
      void loadPage({ limit: 25, offset: 0 }).then((page) => setRack(page.results[0]));
    }, [loadPage]);
    return (
      <>
        <p>Ocupado: {rack ? getOccupiedUnits(rack) : "carregando"}U</p>
        <button disabled={!rack} onClick={() => rack && onSelect(rack)}>
          Abrir rack
        </button>
        <button onClick={onAdd}>Adicionar rack na lista</button>
      </>
    );
  }
  return { default: RackInfoMock };
});

vi.mock("./pages/devices/ObjectInfo/ObjectInfo", () => ({
  default: ({
    device,
    onBack,
    onUpdate,
  }: {
    device: DeviceSummary;
    onBack: () => void;
    onUpdate: (device: DeviceSummary, fields: Record<string, unknown>) => Promise<DeviceSummary>;
  }) => (
    <>
      <p>
        Equipamento: {device.name} (ID {device.id}). Altura: {device.height}U;
        profundidade total: {String(device.fullDepth)}
      </p>
      <button
        onClick={() =>
          void onUpdate(
            {
              ...device,
              primaryIp4Id: 34,
              primaryIp4: "192.0.2.11/24",
            },
            {},
          )
        }
      >
        Atualizar IPv4
      </button>
      <button
        onClick={() =>
          void onUpdate(
            {
              ...device,
              description: "Descrição atualizada",
            },
            {},
          )
        }
      >
        Atualizar descrição
      </button>
      <button onClick={onBack}>Voltar</button>
    </>
  ),
}));

let container: HTMLDivElement;
let root: Root;

beforeEach(async () => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root.render(
      <AccessProvider>
        <App />
      </AccessProvider>,
    ),
  );
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  fixtures.createRack.mockReset();
  fixtures.updateDevice.mockClear();
  fixtures.pageDevices.mockClear();
  fixtures.failRackData = false;
});

async function click(label: string) {
  const button = [...container.querySelectorAll("button")].find(
    (item) => item.textContent === label,
  );
  expect(button, `Botão ${label}`).toBeDefined();
  await act(async () => button!.click());
}

it("carrega a ocupação ao abrir a lista após criar um rack", async () => {
  await click("Adicionar rack");
  await click("Criar rack");
  expect(container.textContent).toContain("Ocupado: 2U");
});

it("mostra a falha de carregamento na lista após criar o rack, sem manter o formulário", async () => {
  fixtures.failRackData = true;
  await click("Adicionar rack");
  await click("Criar rack");
  expect(fixtures.createRack).toHaveBeenCalledTimes(1);
  expect(container.textContent).toContain("Falha ao carregar equipamentos");
  expect(container.textContent).not.toContain("Criar rack");
});

it("atualiza altura e profundidade do equipamento aberto após carregar o tipo", async () => {
  await click("Abrir equipamento");
  expect(container.textContent).toContain(
    "Altura: 2U; profundidade total: true",
  );
});

it("envia o ID do IPv4 primário ao atualizar o equipamento", async () => {
  await click("Abrir equipamento");
  await click("Atualizar IPv4");

  expect(fixtures.updateDevice).toHaveBeenCalledWith(
    10,
    expect.objectContaining({ primary_ip4: 34 }),
  );
});

it("não reenvia o IPv4 primário ao atualizar outro campo", async () => {
  await click("Abrir equipamento");
  await click("Atualizar descrição");

  const payload = fixtures.updateDevice.mock.calls[0]?.[1];
  expect(payload).toEqual(
    expect.objectContaining({ description: "Descrição atualizada" }),
  );
  expect(payload).not.toHaveProperty("primary_ip4");
});

it("abre o equipamento tocado no desenho do rack e volta ao mesmo rack", async () => {
  await click("Visualizar racks");
  await click("Abrir rack");

  const deviceButton = container.querySelector<HTMLButtonElement>(
    "button.rack-elevation__device",
  );
  expect(deviceButton?.textContent).toContain("Servidor 01");
  await act(async () => deviceButton!.click());
  expect(container.textContent).toContain("Equipamento: Servidor 01 (ID 10)");

  await click("Voltar");
  expect(container.textContent).toContain("Desenho do rack");
  expect(container.textContent).toContain("Rack 01");
});

it("volta ao início após abrir um equipamento pela busca inicial", async () => {
  await click("Abrir equipamento");
  await click("Voltar");
  expect(container.textContent).toContain("Abrir equipamento");
});

it("abre a área de conexões a partir do início", async () => {
  await click("Abrir conexões");
  expect(container.textContent).toContain("Lista de conexões");
  await click("Voltar das conexões");
  expect(container.textContent).toContain("Abrir conexões");
});

it("volta à lista de racks quando o cadastro foi aberto nela", async () => {
  await click("Visualizar racks");
  await click("Adicionar rack na lista");
  await click("Voltar do cadastro");
  expect(container.textContent).toContain("Abrir rack");
});

it("busca Service Tag usando a etiqueta de ativo do NetBox", async () => {
  await click("Buscar Service Tag");
  expect(fixtures.pageDevices).toHaveBeenCalledWith({ limit: 10, offset: 0, asset_tag: "ST-ABC123" });
});
