// @vitest-environment jsdom
import { beforeEach as setUpLanguage } from "vitest";
import { setLanguage } from "../../../i18n/language";
setUpLanguage(() => setLanguage("pt"));
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { AccessProvider, useAccess } from "../../../context/AccessContext";
import type { NetBoxCable } from "../../../services";
import ConnectionDetails from "./ConnectionDetails";

function GrantAccess() {
  const { setSessionAccess } = useAccess();
  useEffect(
    () =>
      setSessionAccess(
        {
          id: 1,
          username: "a",
          display: "A",
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
const cable = {
  id: 42,
  url: "http://netbox/api/dcim/cables/42/",
  display: "CAB-42",
  a_terminations: [],
  b_terminations: [],
  status: { value: "connected", label: "Connected" },
  label: "CAB-42",
  color: "",
  length: null,
  description: "",
} as NetBoxCable;
let root: Root;
let container: HTMLDivElement;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
});

it("exibe o caminho sem oferecer exclusão de cabos", async () => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root.render(
      <AccessProvider>
        <GrantAccess />
        <ConnectionDetails
          cable={cable}
          loadPath={async () => ({ kind: "direct", cable })}
          onOpenDevice={vi.fn()}
          onBack={vi.fn()}
        />
      </AccessProvider>,
    ),
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  expect(container.textContent).toContain("CAB-42");
  expect(
    container.querySelector('section[aria-label="Resumo do cabo"]'),
  ).not.toBeNull();
  expect(container.textContent).toContain("Caminho da conexão");
  expect(container.textContent).toContain("2 etapas");
  expect(container.textContent).not.toContain("Excluir cabo");
  expect(container.textContent).not.toContain("Confirmar exclusão");
});
