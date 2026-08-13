import { deviceRolesModule } from './modules/device-roles'
import { deviceTypesModule } from './modules/device-types'
import { devicesModule } from './modules/devices'
import { locationsModule } from './modules/locations'
import { manufacturersModule } from './modules/manufacturers'
import { rackGroupsModule } from './modules/rack-groups'
import { racksModule } from './modules/racks'
import { regionsModule } from './modules/regions'
import { sitesModule } from './modules/sites'

export { NetBoxApiError, netboxClient } from '../client'
export { loadNetBoxData } from './load-data'
export type * from './types'

export const netbox = {
  devices: devicesModule,
  deviceTypes: deviceTypesModule,
  deviceRoles: deviceRolesModule,
  manufacturers: manufacturersModule,
  racks: racksModule,
  rackGroups: rackGroupsModule,
  sites: sitesModule,
  locations: locationsModule,
  regions: regionsModule,
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
