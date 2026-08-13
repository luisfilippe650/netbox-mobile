import { deviceTypeCreateSchema, deviceTypeSchema, netboxClient } from '../../client'
import { deleteResource } from './shared'

const endpoint = '/dcim/device-types/'

export const deviceTypesModule = {
  list: () => netboxClient.list(endpoint, deviceTypeSchema),
  create: (body: unknown) => netboxClient.create(endpoint, body, deviceTypeCreateSchema, deviceTypeSchema),
  delete: (id: number) => deleteResource('device-types', id),
}
