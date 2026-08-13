import { deviceRoleSchema, netboxClient, roleCreateSchema } from '../../client'
import { deleteResource } from './shared'

const endpoint = '/dcim/device-roles/'

export const deviceRolesModule = {
  list: () => netboxClient.list(endpoint, deviceRoleSchema),
  create: (body: unknown) => netboxClient.create(endpoint, body, roleCreateSchema, deviceRoleSchema),
  delete: (id: number) => deleteResource('device-roles', id),
}
