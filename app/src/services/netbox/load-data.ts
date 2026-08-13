import type { NetBoxData } from './types'
import { deviceRolesModule } from './modules/device-roles'
import { deviceTypesModule } from './modules/device-types'
import { devicesModule } from './modules/devices'
import { locationsModule } from './modules/locations'
import { manufacturersModule } from './modules/manufacturers'
import { rackGroupsModule } from './modules/rack-groups'
import { racksModule } from './modules/racks'
import { regionsModule } from './modules/regions'
import { sitesModule } from './modules/sites'

export async function loadNetBoxData(): Promise<NetBoxData> {
  const [devices, deviceTypes, deviceRoles, manufacturers, racks, rackGroups, sites, locations, regions] = await Promise.all([
    devicesModule.list(),
    deviceTypesModule.list(),
    deviceRolesModule.list(),
    manufacturersModule.list(),
    racksModule.list(),
    rackGroupsModule.list(),
    sitesModule.list(),
    locationsModule.list(),
    regionsModule.list(),
  ])
  return { devices, deviceTypes, deviceRoles, manufacturers, racks, rackGroups, sites, locations, regions }
}
