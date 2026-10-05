const rawApiUrl = import.meta.env.VITE_NETBOX_API_URL?.trim();

if (!rawApiUrl) {
  throw new Error("VITE_NETBOX_API_URL não foi configurada.");
}

function parseApiUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("VITE_NETBOX_API_URL não contém uma URL válida.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("VITE_NETBOX_API_URL deve usar HTTP ou HTTPS.");
  }
  if (url.username || url.password) {
    throw new Error("Não inclua credenciais em VITE_NETBOX_API_URL.");
  }
  if (url.search || url.hash) {
    throw new Error("VITE_NETBOX_API_URL não pode conter query ou fragmento.");
  }

  url.pathname = url.pathname.replace(/\/+$/, "");
  return url;
}

const parsedApiUrl = parseApiUrl(rawApiUrl);
if (parsedApiUrl.protocol !== "https:" && import.meta.env.PROD) {
  throw new Error(
    "A API precisa usar HTTPS em produção. Use HTTP somente em desenvolvimento controlado.",
  );
}

const parsedTimeout = Number(
  import.meta.env.VITE_NETBOX_REQUEST_TIMEOUT_MS ?? 15000,
);

export const netboxConfig = {
  apiUrl: parsedApiUrl.toString().replace(/\/+$/, ""),
  apiOrigin: parsedApiUrl.origin,
  apiBasePath: `${parsedApiUrl.pathname}/`,
  requestTimeoutMs:
    Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 15000,
} as const;
