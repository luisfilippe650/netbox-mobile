// @vitest-environment jsdom
import { beforeEach as setUpLanguage } from "vitest";
import { setLanguage } from "../../../i18n/language";
setUpLanguage(() => setLanguage("pt"));
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import type { DeviceSummary } from "../../../services/view_models";
import RackDetails from "./RackDetails";

it("abre um equipamento pelo desenho do rack sem repetir a lista de alocados", async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const summary = { id: "10", name: "Switch" } as DeviceSummary;
  const onSelectDevice = vi.fn();
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  try {
    await act(async () =>
      root.render(
        <RackDetails
          rack={{
            id: "5",
            apiId: 5,
            name: "Rack 01",
            site: "INPE",
            location: "Sala 1",
            group: "Sem grupo",
            role: "Produção",
            height: 2,
            startingUnit: 1,
            width: 19,
            devices: [
              {
                id: "10",
                apiId: 10,
                name: "Switch",
                role: "Rede",
                startingUnit: 1,
                height: 1,
                status: "Ativo",
                summary,
              },
            ],
          }}
          onBack={() => {}}
          onSelectDevice={onSelectDevice}
        />,
      ),
    );

    const equipment = container.querySelector<HTMLButtonElement>(
      ".rack-elevation__device",
    );
    expect(equipment?.getAttribute("aria-label")).toContain("Switch");
    expect(container.textContent).not.toContain("Equipamentos alocados");
    const header = container.querySelector(".page-shell__hero");
    expect(header?.querySelector(".page-shell__eyebrow")).toBeNull();
    expect(header?.textContent).toContain("Rack 01");
    await act(async () => equipment!.click());
    expect(onSelectDevice).toHaveBeenCalledWith(summary);
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});

it("mostra primeiro a face traseira quando só ela contém equipamentos", () => {
  const html = renderToStaticMarkup(
    <RackDetails
      rack={{
        id: "5",
        apiId: 5,
        name: "Rack 01",
        site: "INPE",
        location: "Sala 1",
        group: "Sem grupo",
        role: "Produção",
        height: 2,
        startingUnit: 1,
        width: 19,
        devices: [{
          id: "11",
          apiId: 11,
          name: "Patch panel",
          role: "Rede",
          startingUnit: 1,
          height: 1,
          status: "Ativo",
          face: "rear",
        }],
      }}
      onBack={() => {}}
      onSelectDevice={() => {}}
    />,
  );
  expect(html).toContain('aria-label="Vista traseira do Rack 01"');
  expect(html).toContain("Patch panel");
});
