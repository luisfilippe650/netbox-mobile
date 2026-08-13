import { locationCreateSchema, locationSchema, netboxClient } from '../../client'
import { deleteResource } from './shared'

const endpoint = '/dcim/locations/'

export const locationsModule = {
  list: () => netboxClient.list(endpoint, locationSchema),
  create: (body: unknown) => netboxClient.create(endpoint, body, locationCreateSchema, locationSchema),
  delete: (id: number) => deleteResource('locations', id),
}
