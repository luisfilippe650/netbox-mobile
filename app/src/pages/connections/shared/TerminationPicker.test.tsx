// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import type { ConnectionTermination } from "../../../services";
import TerminationPicker from "./TerminationPicker";

const item = (
  id: number,
  name: string,
  occupied = false,
): ConnectionTermination => ({
  kind: "dcim.interface",
  id,
  display: name,
  name,
  label: "",
  device: { id: 1, display: "Switch", name: "Switch" },
  mark_connected: false,
  cable: null,
  link_peers: [],
  _occupied: occupied,
});

let root: Root;
let container: HTMLDivElement;

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
});

it("pesquisa portas e não oferece terminações ocupadas", async () => {
  const onSelect = vi.fn();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root.render(
      <TerminationPicker
        items={[item(1, "Gi0/1"), item(2, "Gi0/2"), item(3, "Gi0/3", true)]}
        selected={null}
        onSelect={onSelect}
      />,
    ),
  );

  const input = container.querySelector<HTMLInputElement>("input")!;
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    setter.call(input, "0/2");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

  expect(container.textContent).not.toContain("Gi0/1");
  expect(container.textContent).toContain("Gi0/2");
  expect(container.textContent).not.toContain("Gi0/3");
  await act(async () =>
    [...container.querySelectorAll("button")]
      .find((button) => button.textContent?.includes("Gi0/2"))!
      .click(),
  );
  expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
});
