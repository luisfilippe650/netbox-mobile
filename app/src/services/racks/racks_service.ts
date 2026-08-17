import { rackGroupsApi, rackRolesApi, racksApi } from "./racks_api";
import type { NetBoxRack, NetBoxRackRole } from "./racks_dto";
import type {
  DeviceSummary,
  OrganizationSummary,
  RackSummary,
} from "../view_models";

// Expõe as APIs com nomes de domínio para que os consumidores dependam da
// camada de service, e não diretamente da implementação HTTP.
export const racksService = racksApi;
export const rackGroupsService = rackGroupsApi;
export const rackRolesService = rackRolesApi;

/** Cria os resumos das funções de rack exibidos nas listas da aplicação. */
export function mapRackRoles(items: NetBoxRackRole[]): OrganizationSummary[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || "Sem descrição",
    detail: `${item.rack_count} rack(s)`,
    color: item.color,
  }));
}

/**
 * Monta o modelo de visualização de cada rack e associa somente os dispositivos
 * que possuem uma unidade válida nele. Equipamentos vinculados sem posição não
 * ocupam espaço na elevação. A junção fica nesta camada para manter os
 * componentes livres dos detalhes de relacionamento entre os DTOs do NetBox.
 */
export function mapRacks(
  racks: NetBoxRack[],
  devices: readonly DeviceSummary[],
): RackSummary[] {
  return racks.map((rack) => ({
    id: String(rack.id),
    apiId: rack.id,
    name: rack.name,
    site: rack.site.name ?? rack.site.display,
    location: rack.location?.name ?? rack.location?.display ?? "Sem local",
    group: rack.group?.name ?? rack.group?.display ?? "Sem grupo",
    role: rack.role?.name ?? rack.role?.display ?? "Sem função",
    height: rack.u_height,
    startingUnit: rack.starting_unit,
    width: rack.width,
    devices: devices
      .filter(
        (device) => device.rackId === rack.id && device.allocatedUnit > 0,
      )
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
