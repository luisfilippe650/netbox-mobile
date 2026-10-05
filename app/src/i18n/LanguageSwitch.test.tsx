// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { AccessProvider } from "../context/AccessContext";
import Home from "../pages/home/Home";
import RackDetails from "../pages/racks/RackDetails/RackDetails";
import Regions from "../pages/organization/Regions/Regions";
import Login from "../pages/login/Login";
import { getLanguage, setLanguage } from "./language";

let root: Root;
let container: HTMLDivElement;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
  setLanguage("pt");
  localStorage.clear();
});

it("switches the complete UI from the home menu and retains the selection after remount", async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  setLanguage("pt");
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<AccessProvider>
    <Home racks={[]} onLogout={vi.fn()} onDelete={vi.fn()} onOpenPage={vi.fn()} onSelectDevice={vi.fn()} searchDevices={async () => []} />
    <Login onLogin={vi.fn()} />
  </AccessProvider>));
  expect(container.textContent).toContain("Bem-vindo");
  await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Abrir menu"]')!.click());
  const button = (label: string) => [...container.querySelectorAll("button")].find(el => el.textContent === label)!;
  await act(async () => button("Linguagens").click());
  await act(async () => button("English").click());
  expect(getLanguage()).toBe("en");
  expect(container.textContent).toContain("Quick actions");
  expect(container.textContent).toContain("Welcome");
  expect(container.querySelector('label[for="username"]')?.textContent).toBe("Username");
  expect(container.querySelector<HTMLInputElement>('#password')?.placeholder).toBe("Enter your password");
  expect(button("English").getAttribute("aria-pressed")).toBe("true");
  await act(async () => button("Close").click());
  await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Open menu"]')!.click());
  await act(async () => button("About").click());
  expect(container.textContent).toContain("Development and origins");
  expect(container.textContent).toContain("Developed by Luis Filippe Reis Nogueira");
  expect(container.textContent).toContain("Integration with NetBox");
  await act(async () => button("Close").click());
  await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Open menu"]')!.click());
  await act(async () => button("Languages").click());
  await act(async () => button("Português").click());
  expect(container.textContent).toContain("Ações rápidas");
  expect(container.querySelector('label[for="username"]')?.textContent).toBe("Usuário");
  await act(async () => setLanguage("en"));
  await act(async () => root.render(<Login onLogin={vi.fn()} />));
  expect(container.textContent).toContain("Sign in with your account");
});

it("translates internal screens and leaves NetBox names unchanged", async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  setLanguage("en");
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<AccessProvider>
    <Regions onBack={vi.fn()} loadPage={async () => ({results: [], count: 0})} onCreate={vi.fn()} onDelete={vi.fn()} />
    <RackDetails rack={{id: "1", apiId: 1, name: "Nome", site: "Site", location: "Localização", group: "Grupo", role: "Função", height: 2, startingUnit: 1, width: 19, devices: []}} onBack={vi.fn()} onSelectDevice={vi.fn()} />
  </AccessProvider>));
  expect(container.textContent).toContain("Regions");
  expect(container.textContent).toContain("No regions found");
  expect(container.querySelector('.rack-details__hero .page-shell__title')?.textContent ?? [...container.querySelectorAll('h1')].find(el => el.textContent === "Nome")?.textContent).toBe("Nome");
  expect(container.textContent).toContain("Localização");
  expect(container.textContent).toContain("Grupo");
  expect(container.textContent).toContain("Função");
  expect(container.querySelector('[aria-label="front view of Nome"]')).not.toBeNull();
});
