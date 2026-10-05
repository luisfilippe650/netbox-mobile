// @vitest-environment jsdom
import { beforeEach as setUpLanguage } from "vitest";
import { setLanguage } from "../../../i18n/language";
setUpLanguage(() => setLanguage("pt"));
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { AccessProvider, useAccess } from "../../../context/AccessContext";
import type { DeviceSummary } from "../../../services";
import ObjectInfo from "./ObjectInfo";

const device: DeviceSummary = {
  id: "10",
  apiId: 10,
  name: "Servidor 01",
  deviceTypeId: 7,
  roleId: 1,
  role: "Servidor",
  site: "INPE",
  siteId: 1,
  locationId: null,
  region: "Sem local",
  rack: "Sem rack",
  rackId: null,
  allocatedUnit: 0,
  face: null,
  fullDepth: false,
  height: 1,
  status: "Ativo",
  label: "Não informada",
  serial: "",
  assetTag: "",
  description: "",
  deviceType: "Servidor 1U",
  deviceTypeDescription: "",
  manufacturer: "Fabricante",
  primaryIp4Id: 33,
  primaryIp4: "192.0.2.10/24",
  primaryIp6: null,
  customFields: {},
};

function GrantAccess() {
  const { setSessionAccess } = useAccess();
  useEffect(() => {
    setSessionAccess(
      {
        id: 1,
        username: "admin",
        display: "Admin",
        first_name: "",
        last_name: "",
        email: "",
        groups: [],
        permissions: [],
      },
      true,
    );
  }, [setSessionAccess]);
  return null;
}

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

async function renderObjectInfo(
  onUpdate: (draft: DeviceSummary) => Promise<DeviceSummary>,
  loadIpAddresses: () => Promise<
    { id: number; display: string; address: string }[]
  > = async () => [
    { id: 33, display: "192.0.2.10/24", address: "192.0.2.10/24" },
    { id: 34, display: "192.0.2.11/24", address: "192.0.2.11/24" },
  ],
) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root.render(
      <AccessProvider>
        <GrantAccess />
        <ObjectInfo
          device={device}
          sites={[{ id: "1", name: "INPE", description: "", detail: "" }]}
          racks={[]}
          loadCustomFields={async () => []}
          loadConnections={async () => []}
          loadIpAddresses={loadIpAddresses}
          onOpenConnection={() => undefined}
          onOpenDevice={() => undefined}
          onUpdate={onUpdate}
          onBack={() => undefined}
        />
      </AccessProvider>,
    ),
  );

  const customize = [...container.querySelectorAll("button")].find(
    (button) => button.textContent === "Personalizar",
  );
  await act(async () => customize!.click());
  await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
  const field = [...container.querySelectorAll("label")].find(
    (label) => label.querySelector("span")?.textContent === "IPv4 primário",
  );
  return field?.querySelector("select") ?? null;
}

it("permite escolher um IPv4 do dispositivo e envia seu ID ao salvar", async () => {
  const savedDevices: DeviceSummary[] = [];
  const select = await renderObjectInfo(async (draft) => {
    savedDevices.push(draft);
    return draft;
  });
  expect(select).not.toBeNull();
  expect(select?.textContent).toContain("192.0.2.11/24");

  await act(async () => {
    select!.value = "34";
    select!.dispatchEvent(new Event("change", { bubbles: true }));
  });
  const save = [...container.querySelectorAll("button")].find(
    (button) => button.textContent === "Salvar alterações",
  );
  await act(async () => save!.click());

  expect(savedDevices[0]?.primaryIp4Id).toBe(34);
  expect(savedDevices[0]?.primaryIp4).toBe("192.0.2.11/24");
});

it("oferece a remoção do IPv4 primário", async () => {
  const select = await renderObjectInfo(async (draft) => draft);

  expect(
    [...select!.options].some(
      (option) => option.value === "" && option.textContent === "Não informado",
    ),
  ).toBe(true);
});

it("preserva o IPv4 atual quando a lista de endereços falha", async () => {
  const select = await renderObjectInfo(
    async (draft) => draft,
    async () => {
      throw new Error("Sem acesso aos endereços");
    },
  );

  expect(select?.value).toBe("33");
  expect(
    [...(select?.options ?? [])].some(
      (option) =>
        option.value === "33" && option.textContent === "192.0.2.10/24",
    ),
  ).toBe(true);
});
