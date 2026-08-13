import { netboxClient, siteCreateSchema, siteSchema } from '../../client'
import { deleteResource } from './shared'

const endpoint = '/dcim/sites/'

export const sitesModule = {
  list: () => netboxClient.list(endpoint, siteSchema),
  create: (body: unknown) => netboxClient.create(endpoint, body, siteCreateSchema, siteSchema),
  delete: (id: number) => deleteResource('sites', id),
}
