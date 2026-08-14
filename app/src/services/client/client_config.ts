const rawApiUrl = import.meta.env.VITE_NETBOX_API_URL?.trim();

if (!rawApiUrl) {
  throw new Error("VITE_NETBOX_API_URL não foi configurada.");
}

const parsedTimeout = Number(
  import.meta.env.VITE_NETBOX_REQUEST_TIMEOUT_MS ?? 15000,
);

export const netboxConfig = {
  apiUrl: rawApiUrl.replace(/\/+$/, ""),
  requestTimeoutMs:
    Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 15000,
} as const;
