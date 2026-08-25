import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.gov.inpe.netboxmobile",
  appName: "Gerenciador de Datacenter",
  webDir: "dist",
  // A configuração empacotada é sempre segura. O source set Android de debug
  // substitui o esquema local e a política de rede apenas em APKs debuggable.
  server: {
    androidScheme: "https",
    cleartext: false,
  },
};

export default config;
