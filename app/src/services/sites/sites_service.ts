import { locationsApi, regionsApi, sitesApi } from './sites_api'
import type { NetBoxLocation, NetBoxRegion, NetBoxSite } from './sites_dto'
import type { OrganizationSummary } from '../view_models'

// Expõe as APIs com nomes de domínio para que os consumidores dependam da
// camada de service, e não diretamente da implementação HTTP.
export const sitesService = sitesApi
export const locationsService = locationsApi
export const regionsService = regionsApi

/**
 * Adapta sites do NetBox ao modelo comum usado nas listas da organização.
 * Os fallbacks mantêm a renderização previsível quando relações são opcionais.
 */
export function mapSites(items: NetBoxSite[]): OrganizationSummary[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || 'Sem descrição',
    detail: `${item.rack_count} rack(s) · ${item.device_count} equipamento(s)`,
    region: item.region?.name ?? item.region?.display ?? 'Não informada',
    regionId: item.region?.id ?? null,
    tenant: item.tenant?.name ?? item.tenant?.display ?? 'Não informado',
    timezone: item.time_zone ?? 'Não informado',
  }))
}

/**
 * Adapta localizações e preserva o ID do site para filtros e vínculos feitos
 * pela UI sem depender novamente do formato da resposta da API.
 */
export function mapLocations(items: NetBoxLocation[]): OrganizationSummary[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || 'Sem descrição',
    detail: `${item.rack_count} rack(s) · ${item.device_count} equipamento(s)`,
    site: item.site.name ?? item.site.display,
    siteId: item.site.id,
  }))
}

/** Cria os resumos de regiões, incluindo a quantidade de sites vinculados. */
export function mapRegions(items: NetBoxRegion[]): OrganizationSummary[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || 'Sem descrição',
    detail: `${item.site_count} site(s) vinculado(s)`,
  }))
}
