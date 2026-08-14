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

export const devicesService = devicesApi;
export const deviceTypesService = deviceTypesApi;
export const deviceRolesService = deviceRolesApi;
export const manufacturersService = manufacturersApi;

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
    region: device.location?.name ?? device.site.region?.name ?? "Sem local",
    rack: device.rack?.name ?? "Sem rack",
    rackId: device.rack?.id ?? null,
    allocatedUnit: device.position ?? 0,
    height: device.device_type.u_height ?? 1,
    status: localizedStatus(device.status.value),
    label: device.asset_tag || device.serial || "Não informada",
    description: device.description ?? "",
  };
}

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
