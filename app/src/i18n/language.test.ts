// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { displayFallback, format, getLanguage, setLanguage, translate } from "./language";

afterEach(() => { setLanguage("pt"); localStorage.clear(); });

it("translates labels both ways and preserves unknown NetBox data", () => {
  expect(translate("Equipamentos", "en")).toBe("Devices");
  expect(translate("Sign in", "pt")).toBe("Entrar");
  expect(translate("rack-custom-01", "en")).toBe("rack-custom-01");
});

it("translates interpolated messages without changing values", () => {
  expect(translate("Abrir conexão Cable-01", "en")).toBe("Open connection Cable-01");
  expect(translate("Falha na API (HTTP 403): Usuário ou senha inválidos.", "en")).toBe("API request failed (HTTP 403): Invalid username or password.");
});

it("persists the selected language and updates document accessibility", () => {
  setLanguage("en");
  expect(getLanguage()).toBe("en");
  expect(localStorage.getItem("netbox-mobile-language")).toBe("en");
  expect(document.documentElement.lang).toBe("en");
  setLanguage("pt");
  expect(document.documentElement.lang).toBe("pt-BR");
});

it("preserves names that match UI translations when formatting labels", () => {
  setLanguage("en");
  expect(format("Selecionar {0}", ["Nome"])).toBe("Select Nome");
  expect(displayFallback("Nome", "Sem local")).toBe("Nome");
  expect(displayFallback("Sem local", "Sem local")).toBe("No location");
});
