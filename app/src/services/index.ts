import {
  deviceRolesService,
  devicesService,
  deviceTypesService,
  manufacturersService,
} from "./devices/devices_service";
import { rackGroupsService, rackRolesService, racksService } from "./racks/racks_service";
import {
  locationsService,
  regionsService,
  sitesService,
} from "./sites/sites_service";

export { NetBoxApiError, netboxClient } from "./client";
export type { AuthenticatedUser, NetBoxObjectPermission } from "./client";
export { loadNetBoxData } from "./load-data";
export type { NetBoxData } from "./load-data";
export { deviceRoleColors } from "./devices/devices_dto";
export {
  mapDevice,
  mapDeviceRoles,
  mapManufacturers,
} from "./devices/devices_service";
export type * from "./devices/devices_dto";
export { mapRackRoles, mapRacks } from "./racks/racks_service";
export type * from "./racks/racks_dto";
export { mapLocations, mapRegions, mapSites } from "./sites/sites_service";
export type * from "./sites/sites_dto";
export type * from "./view_models";

export const netbox = {
  devices: devicesService,
  deviceTypes: deviceTypesService,
  deviceRoles: deviceRolesService,
  manufacturers: manufacturersService,
  racks: racksService,
  rackGroups: rackGroupsService,
  rackRoles: rackRolesService,
  sites: sitesService,
  locations: locationsService,
  regions: regionsService,
};

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
