import { deviceCreateSchema, deviceSchema, deviceUpdateSchema, netboxClient } from '../../client'
import { deleteResource } from './shared'

const endpoint = '/dcim/devices/'

export const devicesModule = {
  list: () => netboxClient.list(endpoint, deviceSchema),
  create: (body: unknown) => netboxClient.create(endpoint, body, deviceCreateSchema, deviceSchema),
  update: (id: number, body: unknown) => netboxClient.update(`${endpoint}${id}/`, body, deviceUpdateSchema, deviceSchema),
  delete: (id: number) => deleteResource('devices', id),
}
