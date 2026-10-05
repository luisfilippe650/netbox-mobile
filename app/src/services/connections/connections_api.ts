import { NetBoxApiError, netboxClient } from "../client";
import { deleteResource } from "../shared";
import {
  cableCreateSchema,
  cableOptionsSchema,
  cablePathListSchema,
  cableSchema,
  portTerminationSchema,
  traceResponseSchema,
  type CableCreate,
  type ConnectionTermination,
  type TerminationKind,
} from "./connections_dto";

const endpoints = {
  cables: "/dcim/cables/",
  interfaces: "/dcim/interfaces/",
  frontPorts: "/dcim/front-ports/",
  rearPorts: "/dcim/rear-ports/",
} as const;

const endpointForKind = (kind: TerminationKind) =>
  kind === "dcim.interface"
    ? endpoints.interfaces
    : kind === "dcim.frontport"
      ? endpoints.frontPorts
      : endpoints.rearPorts;

const withKind = (
  kind: TerminationKind,
  items: Awaited<ReturnType<typeof netboxClient.list<unknown>>>,
) =>
  items.map(
    (item) =>
      ({ ...portTerminationSchema.parse(item), kind }) as ConnectionTermination,
  );

export const connectionsApi = {
  page: (parameters?: Parameters<typeof netboxClient.page>[2]) =>
    netboxClient.page(endpoints.cables, cableSchema, parameters),
  get: (id: number) =>
    netboxClient.get(`${endpoints.cables}${id}/`, cableSchema),
  create: (body: CableCreate) =>
    netboxClient.create(
      endpoints.cables,
      body,
      cableCreateSchema,
      cableSchema,
    ),
  delete: (id: number) => deleteResource("cables", id),
  metadata: async () =>
    cableOptionsSchema.parse(await netboxClient.options(endpoints.cables)),
  listDeviceTerminations: async (deviceId: number, selectable = false) => {
    const results = await Promise.allSettled([
      netboxClient.list(endpoints.interfaces, portTerminationSchema, {
        device_id: deviceId,
        ...(selectable ? { kind: "physical", occupied: false } : {}),
      }),
      netboxClient.list(endpoints.frontPorts, portTerminationSchema, {
        device_id: deviceId,
        ...(selectable ? { occupied: false } : {}),
      }),
      netboxClient.list(endpoints.rearPorts, portTerminationSchema, {
        device_id: deviceId,
        ...(selectable ? { occupied: false } : {}),
      }),
    ]);
    const failures = results.filter(
      (result): result is PromiseRejectedResult =>
        result.status === "rejected" &&
        !(
          result.reason instanceof NetBoxApiError && result.reason.status === 403
        ),
    );
    if (failures.length > 0) throw failures[0].reason;
    const [interfaces, frontPorts, rearPorts] = results.map((result) =>
      result.status === "fulfilled" ? result.value : [],
    );
    return [
      ...withKind("dcim.interface", interfaces),
      ...withKind("dcim.frontport", frontPorts),
      ...withKind("dcim.rearport", rearPorts),
    ];
  },
  getTermination: async (kind: TerminationKind, id: number) => ({
    ...await netboxClient.get(`${endpointForKind(kind)}${id}/`, portTerminationSchema),
    kind,
  }) as ConnectionTermination,
  traceInterface: (id: number) =>
    netboxClient.get(`${endpoints.interfaces}${id}/trace/`, traceResponseSchema),
  pathsForPort: (kind: Exclude<TerminationKind, "dcim.interface">, id: number) =>
    netboxClient.get(`${endpointForKind(kind)}${id}/paths/`, cablePathListSchema),
};
