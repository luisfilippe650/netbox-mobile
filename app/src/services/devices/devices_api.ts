import { netboxClient } from "../client";
import { deleteResource } from "../shared";
import {
  deviceCreateSchema,
  deviceRoleCreateSchema,
  deviceRoleSchema,
  deviceSchema,
  deviceTypeCreateSchema,
  deviceTypeSchema,
  deviceUpdateSchema,
  manufacturerCreateSchema,
  manufacturerSchema,
} from "./devices_dto";

const endpoints = {
  devices: "/dcim/devices/",
  deviceTypes: "/dcim/device-types/",
  deviceRoles: "/dcim/device-roles/",
  manufacturers: "/dcim/manufacturers/",
} as const;

export const devicesApi = {
  list: () => netboxClient.list(endpoints.devices, deviceSchema),
  create: (body: unknown) =>
    netboxClient.create(
      endpoints.devices,
      body,
      deviceCreateSchema,
      deviceSchema,
    ),
  update: (id: number, body: unknown) =>
    netboxClient.update(
      `${endpoints.devices}${id}/`,
      body,
      deviceUpdateSchema,
      deviceSchema,
    ),
  delete: (id: number) => deleteResource("devices", id),
};

export const deviceTypesApi = {
  list: () => netboxClient.list(endpoints.deviceTypes, deviceTypeSchema),
  create: (body: unknown) =>
    netboxClient.create(
      endpoints.deviceTypes,
      body,
      deviceTypeCreateSchema,
      deviceTypeSchema,
    ),
  delete: (id: number) => deleteResource("device-types", id),
};

export const deviceRolesApi = {
  list: () => netboxClient.list(endpoints.deviceRoles, deviceRoleSchema),
  create: (body: unknown) =>
    netboxClient.create(
      endpoints.deviceRoles,
      body,
      deviceRoleCreateSchema,
      deviceRoleSchema,
    ),
  delete: (id: number) => deleteResource("device-roles", id),
};

export const manufacturersApi = {
  list: () => netboxClient.list(endpoints.manufacturers, manufacturerSchema),
  create: (body: unknown) =>
    netboxClient.create(
      endpoints.manufacturers,
      body,
      manufacturerCreateSchema,
      manufacturerSchema,
    ),
  delete: (id: number) => deleteResource("manufacturers", id),
};
