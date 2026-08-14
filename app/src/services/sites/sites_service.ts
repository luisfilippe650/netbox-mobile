import { locationsApi, regionsApi, sitesApi } from './sites_api'
import type { NetBoxLocation, NetBoxRegion, NetBoxSite } from './sites_dto'
import type { OrganizationSummary } from '../view_models'

export const sitesService = sitesApi
export const locationsService = locationsApi
export const regionsService = regionsApi

export function mapSites(items: NetBoxSite[]): OrganizationSummary[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || 'Sem descrição',
    detail: `${item.rack_count} rack(s) · ${item.device_count} dispositivo(s)`,
    region: item.region?.name ?? 'Não informada',
    regionId: item.region?.id ?? null,
    tenant: item.tenant?.name ?? 'Não informado',
    timezone: item.time_zone ?? 'Não informado',
  }))
}

export function mapLocations(items: NetBoxLocation[]): OrganizationSummary[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || 'Sem descrição',
    detail: `${item.rack_count} rack(s) · ${item.device_count} dispositivo(s)`,
    site: item.site.name ?? item.site.display,
    siteId: item.site.id,
  }))
}

export function mapRegions(items: NetBoxRegion[]): OrganizationSummary[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || 'Sem descrição',
    detail: `${item.site_count} site(s) vinculado(s)`,
  }))
}
