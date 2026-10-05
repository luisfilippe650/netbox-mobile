// @vitest-environment jsdom
import { beforeEach as setUpLanguage } from "vitest";
import { setLanguage } from "../../i18n/language";
setUpLanguage(() => setLanguage("pt"));
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { AccessProvider, useAccess } from "../../context/AccessContext";
import Home from "./Home";

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

let container: HTMLDivElement;
let root: Root;

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
});

it("abre a lista principal diretamente e mantém as opções secundárias acessíveis", async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const onOpenPage = vi.fn();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <AccessProvider>
        <GrantAccess />
        <Home
          onLogout={vi.fn()}
          searchDevices={async () => []}
          racks={[]}
          onSelectDevice={vi.fn()}
          onDelete={async () => undefined}
          onOpenPage={onOpenPage}
        />
      </AccessProvider>,
    );
  });

  const openDevices = container.querySelector<HTMLButtonElement>(
    'button[aria-label="Abrir equipamentos"]',
  );
  expect(openDevices).not.toBeNull();
  await act(async () => openDevices!.click());
  expect(onOpenPage).toHaveBeenCalledWith("devices");

  const moreOptions = container.querySelector<HTMLButtonElement>(
    'button[aria-label="Mais opções de Equipamentos"]',
  );
  expect(moreOptions).not.toBeNull();
  await act(async () => moreOptions!.click());
  expect(container.querySelector('[role="dialog"]')?.textContent).toContain(
    "Adicionar equipamento",
  );

  const openConnections = container.querySelector<HTMLButtonElement>(
    'button[aria-label="Abrir conexões"]',
  );
  expect(openConnections).not.toBeNull();
  expect(
    container.querySelector('button[aria-label="Mais opções de Conexões"]'),
  ).toBeNull();
  await act(async () => openConnections!.click());
  expect(onOpenPage).toHaveBeenCalledWith("connections");
});


it("pesquisa etiquetas alfanuméricas pela opção Service Tag", async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const searchDevices = vi.fn(async () => []);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(
    <AccessProvider>
      <GrantAccess />
      <Home onLogout={() => {}} searchDevices={searchDevices} racks={[]}
        onSelectDevice={() => {}} onDelete={async () => undefined} onOpenPage={() => {}} />
    </AccessProvider>,
  ));
  const search = [...container.querySelectorAll("button")].find(button => button.textContent?.includes("Buscar equipamento"));
  await act(async () => search!.click());
  const serviceTag = [...container.querySelectorAll("button")].find(button => button.textContent?.trim() === "Service Tag");
  expect(serviceTag).toBeDefined();
  await act(async () => serviceTag!.click());
  const input = container.querySelector<HTMLInputElement>('input[placeholder="Digite o Service Tag"]')!;
  expect(input.inputMode).not.toBe("numeric");
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "ST-ABC123");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 300)); });
  expect(searchDevices).toHaveBeenCalledWith("asset_tag", "ST-ABC123");
});
