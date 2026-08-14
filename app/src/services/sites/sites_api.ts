import { netboxClient } from '../client'
import { deleteResource } from '../shared'
import {
  locationCreateSchema,
  locationSchema,
  regionCreateSchema,
  regionSchema,
  siteCreateSchema,
  siteSchema,
} from './sites_dto'

const endpoints = {
  sites: '/dcim/sites/',
  locations: '/dcim/locations/',
  regions: '/dcim/regions/',
} as const

export const sitesApi = {
  list: () => netboxClient.list(endpoints.sites, siteSchema),
  create: (body: unknown) => netboxClient.create(endpoints.sites, body, siteCreateSchema, siteSchema),
  delete: (id: number) => deleteResource('sites', id),
}

export const locationsApi = {
  list: () => netboxClient.list(endpoints.locations, locationSchema),
  create: (body: unknown) => netboxClient.create(endpoints.locations, body, locationCreateSchema, locationSchema),
  delete: (id: number) => deleteResource('locations', id),
}

export const regionsApi = {
  list: () => netboxClient.list(endpoints.regions, regionSchema),
  create: (body: unknown) => netboxClient.create(endpoints.regions, body, regionCreateSchema, regionSchema),
  delete: (id: number) => deleteResource('regions', id),
}
