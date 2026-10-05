import {
  deviceRolesService,
  devicesService,
  deviceTypesService,
  manufacturersService,
} from "./devices/devices_service";
import type {
  NetBoxDevice,
  NetBoxDeviceRole,
  NetBoxDeviceType,
  NetBoxManufacturer,
} from "./devices/devices_dto";
import {
  rackGroupsService,
  rackRolesService,
  racksService,
} from "./racks/racks_service";
import type {
  NetBoxRack,
  NetBoxRackGroup,
  NetBoxRackRole,
} from "./racks/racks_dto";
import {
  locationsService,
  regionsService,
  sitesService,
} from "./sites/sites_service";
import type {
  NetBoxLocation,
  NetBoxRegion,
  NetBoxSite,
} from "./sites/sites_dto";

export type NetBoxData = {
  devices: NetBoxDevice[];
  deviceTypes: NetBoxDeviceType[];
  deviceRoles: NetBoxDeviceRole[];
  manufacturers: NetBoxManufacturer[];
  racks: NetBoxRack[];
  rackGroups: NetBoxRackGroup[];
  rackRoles: NetBoxRackRole[];
  sites: NetBoxSite[];
  locations: NetBoxLocation[];
  regions: NetBoxRegion[];
};

export type NetBoxDataKey = keyof NetBoxData;
export type CanViewObject = (objectType: string) => boolean;

const catalogObjectTypes: Record<NetBoxDataKey, string> = {
  devices: "dcim.device",
  deviceTypes: "dcim.devicetype",
  deviceRoles: "dcim.devicerole",
  manufacturers: "dcim.manufacturer",
  racks: "dcim.rack",
  rackGroups: "dcim.rackgroup",
  rackRoles: "dcim.rackrole",
  sites: "dcim.site",
  locations: "dcim.location",
  regions: "dcim.region",
};

const catalogLoaders: {
  [Key in NetBoxDataKey]: () => Promise<NetBoxData[Key]>;
} = {
  devices: devicesService.list,
  deviceTypes: deviceTypesService.list,
  deviceRoles: deviceRolesService.list,
  manufacturers: manufacturersService.list,
  racks: racksService.list,
  rackGroups: rackGroupsService.list,
  rackRoles: rackRolesService.list,
  sites: sitesService.list,
  locations: locationsService.list,
  regions: regionsService.list,
};

/**
 * Carrega em paralelo apenas os catálogos solicitados e autorizados. Dessa
 * forma, a abertura de uma página não depende de domínios sem relação com ela.
 */
export async function loadNetBoxData(
  keys: readonly NetBoxDataKey[],
  canView: CanViewObject,
): Promise<Partial<NetBoxData>> {
  const permittedKeys = keys.filter((key) => canView(catalogObjectTypes[key]));
  const entries = await Promise.all(
    permittedKeys.map(
      async (key) => [key, await catalogLoaders[key]()] as const,
    ),
  );

  return Object.fromEntries(entries) as Partial<NetBoxData>;
}
