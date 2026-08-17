import { netboxClient } from "../client";
import { deleteResource } from "../shared";
import {
  deviceCreateSchema,
  customFieldChoiceSchema,
  customFieldSchema,
  deviceRoleCreateSchema,
  deviceRoleSchema,
  deviceSchema,
  deviceTypeCreateSchema,
  deviceTypeSchema,
  deviceUpdateSchema,
  manufacturerCreateSchema,
  manufacturerSchema,
  objectTypeSchema,
  relatedObjectSchema,
} from "./devices_dto";

const endpoints = {
  devices: "/dcim/devices/",
  deviceTypes: "/dcim/device-types/",
  deviceRoles: "/dcim/device-roles/",
  manufacturers: "/dcim/manufacturers/",
  customFields: "/extras/custom-fields/",
  customFieldChoiceSets: "/extras/custom-field-choice-sets/",
  objectTypes: "/core/object-types/",
} as const;

export const devicesApi = {
  list: (parameters: Record<string, string | number | undefined> = {}) =>
    netboxClient.list(endpoints.devices, deviceSchema, parameters),
  page: (parameters?: Parameters<typeof netboxClient.page>[2]) =>
    netboxClient.page(endpoints.devices, deviceSchema, parameters),
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

export const customFieldsApi = {
  listForDevices: () =>
    netboxClient.list(endpoints.customFields, customFieldSchema, {
      object_type: "dcim.device",
    }),
  listChoices: async (choiceSetId: number) => {
    const choices = await netboxClient.list(
      `${endpoints.customFieldChoiceSets}${choiceSetId}/choices/`,
      customFieldChoiceSchema,
    );
    return choices.map((choice): [typeof choice.id, string] => [
      choice.id,
      choice.display,
    ]);
  },
  listObjectTypes: () =>
    netboxClient.list(endpoints.objectTypes, objectTypeSchema),
  listRelatedObjects: (
    endpoint: string,
    parameters: Record<string, string | number | undefined>,
  ) => netboxClient.list(endpoint, relatedObjectSchema, parameters),
};

export const deviceTypesApi = {
  list: () => netboxClient.list(endpoints.deviceTypes, deviceTypeSchema),
  page: (parameters?: Parameters<typeof netboxClient.page>[2]) =>
    netboxClient.page(endpoints.deviceTypes, deviceTypeSchema, parameters),
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
  page: (parameters?: Parameters<typeof netboxClient.page>[2]) =>
    netboxClient.page(endpoints.deviceRoles, deviceRoleSchema, parameters),
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
  page: (parameters?: Parameters<typeof netboxClient.page>[2]) =>
    netboxClient.page(endpoints.manufacturers, manufacturerSchema, parameters),
  create: (body: unknown) =>
    netboxClient.create(
      endpoints.manufacturers,
      body,
      manufacturerCreateSchema,
      manufacturerSchema,
    ),
  delete: (id: number) => deleteResource("manufacturers", id),
};
