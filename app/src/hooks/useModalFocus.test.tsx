// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it } from "vitest";
import { useModalFocus } from "./useModalFocus";

let root: Root | null = null;
let host: HTMLDivElement | null = null;

afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  host?.remove();
  root = null;
  host = null;
});

it("mantém o foco no diálogo, fecha com Escape e devolve o foco ao botão", async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  function Example() {
    const [open, setOpen] = useState(false);
    useModalFocus(open, () => setOpen(false));
    return (
      <>
        <button onClick={() => setOpen(true)}>Abrir</button>
        {open ? (
          <section role="dialog" aria-modal="true" aria-label="Exemplo">
            <button>Primeiro</button>
            <button>Último</button>
          </section>
        ) : null}
      </>
    );
  }
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root?.render(<Example />));
  const opener = host.querySelector("button")!;
  opener.focus();
  await act(async () => opener.click());
  const buttons = host.querySelectorAll("[role=dialog] button");
  expect(document.activeElement).toBe(buttons[0]);

  (buttons[1] as HTMLButtonElement).focus();
  const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
  document.dispatchEvent(tab);
  expect(tab.defaultPrevented).toBe(true);
  expect(document.activeElement).toBe(buttons[0]);

  await act(async () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  });
  expect(host.querySelector("[role=dialog]")).toBeNull();
  expect(document.activeElement).toBe(opener);
});
