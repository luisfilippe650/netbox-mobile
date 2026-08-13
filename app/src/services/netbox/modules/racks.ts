import { netboxClient, rackCreateSchema, rackSchema } from '../../client'
import { deleteResource } from './shared'

const endpoint = '/dcim/racks/'

export const racksModule = {
  list: () => netboxClient.list(endpoint, rackSchema),
  create: (body: unknown) => netboxClient.create(endpoint, body, rackCreateSchema, rackSchema),
  delete: (id: number) => deleteResource('racks', id),
}
