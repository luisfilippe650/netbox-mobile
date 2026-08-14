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

export async function loadNetBoxData(): Promise<NetBoxData> {
  const [
    devices,
    deviceTypes,
    deviceRoles,
    manufacturers,
    racks,
    rackGroups,
    rackRoles,
    sites,
    locations,
    regions,
  ] = await Promise.all([
    devicesService.list(),
    deviceTypesService.list(),
    deviceRolesService.list(),
    manufacturersService.list(),
    racksService.list(),
    rackGroupsService.list(),
    rackRolesService.list(),
    sitesService.list(),
    locationsService.list(),
    regionsService.list(),
  ]);
  return {
    devices,
    deviceTypes,
    deviceRoles,
    manufacturers,
    racks,
    rackGroups,
    rackRoles,
    sites,
    locations,
    regions,
  };
}
