import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "br.gov.inpe.netboxmobile",
  appName: "Datacenter Manager",
  webDir: "dist",
  // O manifesto Android de debug permite HTTP apenas em APKs de desenvolvimento.
  server: {
    androidScheme: "https",
    cleartext: false,
  },
};

export default config;
