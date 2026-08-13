import type { DeviceSummary } from "../../pages/devices/devices-data";
import type { OrganizationItem } from "../../pages/organization/OrganizationList";
import type { RackSummary } from "../../pages/racks/data";
import type {
  NetBoxDevice,
  NetBoxDeviceRole,
  NetBoxLocation,
  NetBoxManufacturer,
  NetBoxRack,
  NetBoxRegion,
  NetBoxSite,
} from "./types";

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

export function mapSites(items: NetBoxSite[]): OrganizationItem[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || "Sem descrição",
    detail: `${item.rack_count} rack(s) · ${item.device_count} dispositivo(s)`,
    region: item.region?.name ?? "Não informada",
    regionId: item.region?.id ?? null,
    tenant: item.tenant?.name ?? "Não informado",
    timezone: item.time_zone ?? "Não informado",
  }));
}

export function mapLocations(items: NetBoxLocation[]): OrganizationItem[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || "Sem descrição",
    detail: `${item.rack_count} rack(s) · ${item.device_count} dispositivo(s)`,
    site: item.site.name ?? item.site.display,
    siteId: item.site.id,
  }));
}

export function mapRegions(items: NetBoxRegion[]): OrganizationItem[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || "Sem descrição",
    detail: `${item.site_count} site(s) vinculado(s)`,
  }));
}

export function mapManufacturers(
  items: NetBoxManufacturer[],
): OrganizationItem[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || "Sem descrição",
    detail: `${item.device_type_count ?? 0} tipo(s) de dispositivo`,
  }));
}

export function mapDeviceRoles(items: NetBoxDeviceRole[]): OrganizationItem[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || "Sem descrição",
    detail: `Função da VM: ${item.vm_role ? "Sim" : "Não"} · Cor: #${item.color}`,
    vmRole: item.vm_role,
    color: item.color,
  }));
}

export function mapRacks(
  racks: NetBoxRack[],
  devices: DeviceSummary[],
): RackSummary[] {
  return racks.map((rack) => ({
    id: String(rack.id),
    apiId: rack.id,
    name: rack.name,
    site: rack.site.name ?? rack.site.display,
    location: rack.location?.name ?? "Sem local",
    group: rack.group?.name ?? "Sem grupo",
    height: rack.u_height,
    width: rack.width,
    devices: devices
      .filter((device) => device.rackId === rack.id)
      .map((device) => ({
        id: device.id,
        apiId: device.apiId,
        name: device.name,
        role: device.role,
        startingUnit: device.allocatedUnit,
        height: device.height,
        status: device.status,
      })),
  }));
}
