import { netboxClient, rackGroupCreateSchema, rackGroupSchema } from '../../client'
import { deleteResource } from './shared'

const endpoint = '/dcim/rack-groups/'

export const rackGroupsModule = {
  list: () => netboxClient.list(endpoint, rackGroupSchema),
  create: (body: unknown) => netboxClient.create(endpoint, body, rackGroupCreateSchema, rackGroupSchema),
  delete: (id: number) => deleteResource('rack-groups', id),
}
