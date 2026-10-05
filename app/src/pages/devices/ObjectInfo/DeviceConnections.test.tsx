// @vitest-environment jsdom
import { beforeEach as setUpLanguage } from "vitest";
import { setLanguage } from "../../../i18n/language";
setUpLanguage(() => setLanguage("pt"));
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import type { ConnectionTermination } from "../../../services";
import DeviceConnections from "./DeviceConnections";

const base: ConnectionTermination = { kind: "dcim.interface", id: 1, display: "eth0", name: "eth0", label: "", device: { id: 10, display: "Servidor", name: "Servidor" }, mark_connected: false, cable: { id: 42, display: "CAB-42" }, cable_end: "A", link_peers: [], connected_endpoints: [{ id: 2, display: "Gi0/1", device: { id: 20, display: "Switch", name: "Switch" } }], _occupied: true };
let root: Root; let container: HTMLDivElement;
afterEach(async () => { if (root) await act(async () => root.unmount()); container?.remove(); });

it("mostra estados e abre cabo e dispositivo remoto", async () => {
  const openCable = vi.fn(); const openDevice = vi.fn();
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  await act(async () => root.render(<DeviceConnections deviceId={10} load={async () => [base, { ...base, id: 3, name: "eth1", cable: null, _occupied: false, connected_endpoints: [] }]} onOpenCable={openCable} onOpenDevice={openDevice} />));
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 10)); });
  expect(container.textContent).toContain("Conectada"); expect(container.textContent).toContain("Disponível");
  const openConnection = [...container.querySelectorAll("button")].find(
    (item) => item.textContent === "Abrir conexão CAB-42",
  );
  expect(openConnection).toBeDefined();
  await act(async () => openConnection!.click());
  expect(openCable).toHaveBeenCalledWith(42);
  await act(async () => [...container.querySelectorAll("button")].find((item) => item.textContent?.includes("Switch"))!.click());
  expect(openDevice).toHaveBeenCalledWith(20);
});
