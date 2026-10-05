import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_NETBOX_API_URL?.trim();
  const isAndroidDebugBuild =
    command === "build" &&
    mode === "development" &&
    process.env.NODE_ENV === "development";

  if (command === "build" && !isAndroidDebugBuild && apiUrl) {
    let protocol: string;
    try {
      protocol = new URL(apiUrl).protocol;
    } catch {
      throw new Error("VITE_NETBOX_API_URL não contém uma URL válida.");
    }
    if (protocol !== "https:") {
      throw new Error(
        "Builds de produção exigem VITE_NETBOX_API_URL com HTTPS. Use build:android:debug somente para testes HTTP.",
      );
    }
  }

  return {
    plugins: [react()],
  };
});
