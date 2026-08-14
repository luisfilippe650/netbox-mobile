import type { CapacitorConfig } from "@capacitor/cli";

const allowCleartext = process.env.CAPACITOR_ALLOW_CLEARTEXT === "true";

const config: CapacitorConfig = {
  appId: "br.gov.inpe.netboxmobile",
  appName: "Gerenciador de Datacenter",
  webDir: "dist",
  // HTTPS é o padrão. HTTP exige uma liberação explícita ao sincronizar um APK
  // de desenvolvimento: CAPACITOR_ALLOW_CLEARTEXT=true npx cap sync android.
  server: {
    androidScheme: allowCleartext ? "http" : "https",
    cleartext: allowCleartext,
  },
};

export default config;
