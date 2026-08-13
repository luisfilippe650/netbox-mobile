import { netboxClient, regionCreateSchema, regionSchema } from '../../client'
import { deleteResource } from './shared'

const endpoint = '/dcim/regions/'

export const regionsModule = {
  list: () => netboxClient.list(endpoint, regionSchema),
  create: (body: unknown) => netboxClient.create(endpoint, body, regionCreateSchema, regionSchema),
  delete: (id: number) => deleteResource('regions', id),
}
