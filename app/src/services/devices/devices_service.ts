import {
  deviceRolesApi,
  devicesApi,
  deviceTypesApi,
  manufacturersApi,
} from "./devices_api";
import type {
  NetBoxDevice,
  NetBoxDeviceRole,
  NetBoxManufacturer,
} from "./devices_dto";
import type { DeviceSummary, OrganizationSummary } from "../view_models";

// Expõe as APIs com nomes de domínio para que os consumidores dependam da
// camada de service, e não diretamente da implementação HTTP.
export const devicesService = devicesApi;
export const deviceTypesService = deviceTypesApi;
export const deviceRolesService = deviceRolesApi;
export const manufacturersService = manufacturersApi;

/**
 * Converte o valor estável retornado pela API no texto apresentado pela UI.
 * Valores novos do NetBox são preservados para que a interface não esconda
 * um status ainda não mapeado pelo aplicativo.
 */
function localizedStatus(value: string) {
  const labels: Record<string, string> = {
    active: "Ativo",
    planned: "Planejado",
    staged: "Preparação",
    failed: "Falha",
    offline: "Offline",
    decommissioning: "Desativação",
    inventory: "Inventário",
  };
  return labels[value] ?? value ?? "Não informado";
}

/**
 * Adapta um dispositivo do contrato do NetBox ao formato consumido pelas telas.
 * Além de normalizar IDs, concentra aqui os fallbacks para relacionamentos
 * opcionais, evitando que cada componente precise conhecer o DTO da API.
 */
export function mapDevice(device: NetBoxDevice): DeviceSummary {
  return {
    id: String(device.id),
    apiId: device.id,
    name: device.name || device.display,
    deviceTypeId: device.device_type.id,
    roleId: device.role.id,
    role: device.role.name ?? device.role.display,
    site: device.site.name ?? device.site.display,
    siteId: device.site.id,
    locationId: device.location?.id ?? null,
    region:
      device.location?.name ??
      device.location?.display ??
      device.site.region?.name ??
      device.site.region?.display ??
      "Sem local",
    rack: device.rack?.name ?? device.rack?.display ?? "Sem rack",
    rackId: device.rack?.id ?? null,
    allocatedUnit: device.position ?? 0,
    height: device.device_type.u_height ?? 1,
    status: localizedStatus(device.status.value),
    label: device.asset_tag || device.serial || "Não informada",
    description: device.description ?? "",
  };
}

/** Cria os resumos de fabricantes exibidos nas listas da aplicação. */
export function mapManufacturers(
  items: NetBoxManufacturer[],
): OrganizationSummary[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || "Sem descrição",
    detail: `${item.device_type_count ?? 0} tipo(s) de dispositivo`,
  }));
}

/**
 * Cria os resumos de funções de dispositivo e mantém os metadados usados pela
 * UI para diferenciar funções permitidas em máquinas virtuais.
 */
export function mapDeviceRoles(
  items: NetBoxDeviceRole[],
): OrganizationSummary[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || "Sem descrição",
    detail: `Função da VM: ${item.vm_role ? "Sim" : "Não"}`,
    vmRole: item.vm_role,
    color: item.color,
  }));
}
