import type { OrganizationItem } from "./OrganizationList";

export const initialSites: readonly OrganizationItem[] = [
  {
    id: "SITE-01",
    name: "INPE — São José dos Campos",
    description: "Sede principal do datacenter",
    detail: "2 locais vinculados",
    region: "Sudeste",
    tenant: "INPE",
    timezone: "America/Sao_Paulo",
  },
  {
    id: "SITE-02",
    name: "INPE — Cachoeira Paulista",
    description: "Unidade regional",
    detail: "1 local vinculado",
    region: "Sudeste",
    tenant: "INPE",
    timezone: "America/Sao_Paulo",
  },
  {
    id: "SITE-03",
    name: "INPE — Cuiabá",
    description: "Estação de recepção",
    detail: "1 local vinculado",
    region: "Centro-Oeste",
    tenant: "INPE",
    timezone: "America/Cuiaba",
  },
];

export const initialLocations: readonly OrganizationItem[] = [
  {
    id: "LOC-01",
    name: "Datacenter Principal",
    description: "Sala principal de infraestrutura e processamento",
    detail: "3 regiões vinculadas",
    site: "INPE — São José dos Campos",
  },
  {
    id: "LOC-02",
    name: "Sala de Telecomunicações",
    description: "Área dedicada aos equipamentos de telecomunicações",
    detail: "2 regiões vinculadas",
    site: "INPE — São José dos Campos",
  },
  {
    id: "LOC-03",
    name: "Datacenter Regional",
    description: "Infraestrutura da unidade regional",
    detail: "1 região vinculada",
    site: "INPE — Cachoeira Paulista",
  },
];
