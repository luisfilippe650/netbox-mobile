import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("mantém HTTPS no Capacitor mesmo com flags locais de HTTP", async () => {
  vi.stubEnv("CAPACITOR_ALLOW_CLEARTEXT", "true");
  vi.stubEnv("VITE_NETBOX_API_URL", "http://192.0.2.10:8000/api");
  vi.stubEnv("VITE_ALLOW_INSECURE_HTTP", "true");

  const { default: config } = await import("../capacitor.config");
  expect(config.server).toMatchObject({ androidScheme: "https", cleartext: false });
});
