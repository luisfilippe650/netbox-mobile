import { netboxClient } from "../client";
import { deleteResource } from "../shared";
import {
  rackCreateSchema,
  rackGroupCreateSchema,
  rackGroupSchema,
  rackRoleSchema,
  rackRoleCreateSchema,
  rackSchema,
} from "./racks_dto";

const endpoints = {
  racks: "/dcim/racks/",
  rackGroups: "/dcim/rack-groups/",
  rackRoles: "/dcim/rack-roles/",
} as const;

export const racksApi = {
  list: () => netboxClient.list(endpoints.racks, rackSchema),
  create: (body: unknown) =>
    netboxClient.create(endpoints.racks, body, rackCreateSchema, rackSchema),
  delete: (id: number) => deleteResource("racks", id),
};

export const rackGroupsApi = {
  list: () => netboxClient.list(endpoints.rackGroups, rackGroupSchema),
  create: (body: unknown) =>
    netboxClient.create(
      endpoints.rackGroups,
      body,
      rackGroupCreateSchema,
      rackGroupSchema,
    ),
  delete: (id: number) => deleteResource("rack-groups", id),
};

export const rackRolesApi = {
  list: () => netboxClient.list(endpoints.rackRoles, rackRoleSchema),
  create: (body: unknown) =>
    netboxClient.create(
      endpoints.rackRoles,
      body,
      rackRoleCreateSchema,
      rackRoleSchema,
    ),
  delete: (id: number) => deleteResource("rack-roles", id),
};
