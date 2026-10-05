// @vitest-environment jsdom
import { beforeEach as setUpLanguage } from "vitest";
import { setLanguage } from "../../../i18n/language";
setUpLanguage(() => setLanguage("pt"));
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type {
  ConnectionTermination,
  DeviceSummary,
  NetBoxCable,
} from "../../../services";
import AddConnection from "./AddConnection";

const device = (apiId: number, name: string) =>
  ({ apiId, id: String(apiId), name }) as DeviceSummary;
const port = (
  deviceId: number,
  id: number,
  name: string,
): ConnectionTermination => ({
  kind: "dcim.interface",
  id,
  display: name,
  name,
  label: "",
  device: { id: deviceId, display: `D${deviceId}`, name: `D${deviceId}` },
  mark_connected: false,
  cable: null,
  link_peers: [],
  _occupied: false,
});
const created = { id: 9, label: "CAB-09" } as NetBoxCable;
let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
});
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
});

async function change(label: string, value: string) {
  const input = [...container.querySelectorAll("input")].find((item) =>
    item.labels?.[0]?.textContent?.includes(label),
  );
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    setter.call(input, value);
    input!.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 280));
  });
}
async function click(text: string) {
  const button = [...container.querySelectorAll("button")].find(
    (item) => item.textContent?.trim() === text,
  );
  expect(button, text).toBeDefined();
  await act(async () => button!.click());
}

it("seleciona duas extremidades, revisa e cria um cabo", async () => {
  const create = vi.fn().mockResolvedValue(created);
  const onCreated = vi.fn();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root.render(
      <AddConnection
        searchDevices={async (query) =>
          query.includes("Serv")
            ? [device(10, "Servidor")]
            : [device(20, "Switch")]
        }
        loadTerminations={async (id) =>
          id === 10 ? [port(10, 101, "eth0")] : [port(20, 201, "Gi0/1")]
        }
        loadMetadata={async () => ({
          actions: {
            POST: {
              type: { choices: [{ value: "cat6a", display_name: "CAT6a" }] },
            },
          },
        })}
        revalidate={async (_kind, id) =>
          id === 101 ? port(10, 101, "eth0") : port(20, 201, "Gi0/1")
        }
        create={create}
        onCreated={onCreated}
        onBack={vi.fn()}
      />,
    ),
  );

  await change("Buscar dispositivo A", "Servidor");
  await click("Servidor");
  await click("eth0");
  await change("Buscar dispositivo B", "Switch");
  await click("Switch");
  await click("Gi0/1");
  await click("Revisar conexão");
  expect(container.textContent).toContain("Servidor · eth0");
  expect(container.textContent).toContain("Switch · Gi0/1");
  await click("Confirmar criação");
  expect(create).toHaveBeenCalledWith(
    expect.objectContaining({
      a_terminations: [{ object_type: "dcim.interface", object_id: 101 }],
      b_terminations: [{ object_type: "dcim.interface", object_id: 201 }],
    }),
  );
  expect(container.textContent).toContain("Conexão criada");
  expect(container.textContent).toContain("Criar próximo trecho");
  expect(onCreated).not.toHaveBeenCalled();
  await click("Voltar às conexões");
  expect(onCreated).toHaveBeenCalledWith(created);
});

it("permite trocar o dispositivo selecionado em cada extremidade", async () => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root.render(
      <AddConnection
        searchDevices={async (query) =>
          query.includes("Servidor")
            ? [device(10, "Servidor")]
            : [device(11, "Roteador")]
        }
        loadTerminations={async (id) => [port(id, id * 10, `Porta ${id}`)]}
        loadMetadata={async () => ({ actions: { POST: {} } })}
        revalidate={async (_kind, id) => port(10, id, "Porta")}
        create={vi.fn()}
        onCreated={vi.fn()}
        onBack={vi.fn()}
      />,
    ),
  );

  await change("Buscar dispositivo A", "Servidor");
  await click("Servidor");
  expect(container.textContent).toContain("Selecionado: Servidor");

  await click("Alterar dispositivo A");
  expect(container.textContent).not.toContain("Selecionado: Servidor");
  await change("Buscar dispositivo A", "Roteador");
  await click("Roteador");
  expect(container.textContent).toContain("Selecionado: Roteador");
});
