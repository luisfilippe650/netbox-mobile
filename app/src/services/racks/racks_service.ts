import { rackGroupsApi, rackRolesApi, racksApi } from './racks_api'
import type { NetBoxRack, NetBoxRackRole } from './racks_dto'
import type { DeviceSummary, OrganizationSummary, RackSummary } from '../view_models'

export const racksService = racksApi
export const rackGroupsService = rackGroupsApi
export const rackRolesService = rackRolesApi

export function mapRackRoles(items: NetBoxRackRole[]): OrganizationSummary[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || 'Sem descrição',
    detail: `${item.rack_count} rack(s)`,
    color: item.color,
  }))
}

export function mapRacks(racks: NetBoxRack[], devices: readonly DeviceSummary[]): RackSummary[] {
  return racks.map((rack) => ({
    id: String(rack.id),
    apiId: rack.id,
    name: rack.name,
    site: rack.site.name ?? rack.site.display,
    location: rack.location?.name ?? 'Sem local',
    group: rack.group?.name ?? 'Sem grupo',
    role: rack.role?.name ?? 'Sem função',
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
  }))
}
