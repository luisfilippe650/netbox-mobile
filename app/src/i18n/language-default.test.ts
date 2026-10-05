// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from "vitest";

beforeEach(() => { localStorage.clear(); vi.resetModules(); });

it("uses English when no preference has been saved", async () => {
  const {getLanguage} = await import("./language");
  expect(getLanguage()).toBe("en");
  expect(document.documentElement.lang).toBe("en");
});

it("respects an existing Portuguese preference", async () => {
  localStorage.setItem("netbox-mobile-language", "pt");
  const {getLanguage} = await import("./language");
  expect(getLanguage()).toBe("pt");
  expect(document.documentElement.lang).toBe("pt-BR");
});
