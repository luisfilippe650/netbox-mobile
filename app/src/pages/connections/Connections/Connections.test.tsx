// @vitest-environment jsdom
import { beforeEach as setUpLanguage } from "vitest";
import { setLanguage } from "../../../i18n/language";
setUpLanguage(() => setLanguage("pt"));
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { AccessProvider, useAccess } from "../../../context/AccessContext";
import type { NetBoxCable } from "../../../services";
import Connections from "./Connections";

function GrantAccess() {
  const { setSessionAccess } = useAccess();
  useEffect(
    () =>
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
      ),
    [setSessionAccess],
  );
  return null;
}

const cable: NetBoxCable = {
  id: 42,
  url: "http://netbox/api/dcim/cables/42/",
  display: "CAB-42",
  a_terminations: [
    { object_type: "dcim.interface", object_id: 1, object: {
      id: 1, display: "Ethernet1", name: "Ethernet1", label: "", device: { id: 10, display: "Switch principal", name: "Switch principal" }, mark_connected: false, cable: null, link_peers: [], _occupied: true,
    } },
  ],
  b_terminations: [
    { object_type: "dcim.rearport", object_id: 2, object: null },
  ],
  status: { value: "connected", label: "Connected" },
  type: { value: "cat6a", label: "CAT6a" },
  label: "CAB-42",
  color: "2196f3",
  length: 5,
  length_unit: { value: "m", label: "Meters" },
  description: "",
};

let root: Root;
let container: HTMLDivElement;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
});

it("lista cabos reais e abre o item selecionado", async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const onSelect = vi.fn();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root.render(
      <AccessProvider>
        <GrantAccess />
        <Connections
          loadPage={async () => ({ count: 1, results: [cable] })}
          onSelect={onSelect}
          onBack={vi.fn()}
        />
      </AccessProvider>,
    ),
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  expect(container.textContent).toContain("CAB-42");
  expect(container.textContent).toContain("CAT6a");
  expect(container.textContent).toContain("Switch principal");
  expect(container.textContent).toContain("Ethernet1");
  expect(container.textContent).toContain("Conectado");
  expect(container.textContent).toContain("Porta traseira #2");
  expect(container.textContent).not.toContain("Nova conexão");
  const button = container.querySelector<HTMLButtonElement>(
    'button[aria-label="Abrir conexão CAB-42"]',
  );
  await act(async () => button!.click());
  expect(onSelect).toHaveBeenCalledWith(cable);
});
