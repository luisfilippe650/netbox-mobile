import { connectionsApi } from "./connections_api";
import type {
  CablePath,
  NetBoxCable,
  TerminationKind,
} from "./connections_dto";

function cableHasId(path: unknown, cableId: number): boolean {
  if (Array.isArray(path)) return path.some((item) => cableHasId(item, cableId));
  if (!path || typeof path !== "object") return false;
  const record = path as Record<string, unknown>;
  return record.id === cableId && typeof record.status === "object";
}

export type CablePathSource =
  | { kind: "trace"; trace: Awaited<ReturnType<typeof connectionsApi.traceInterface>> }
  | { kind: "paths"; path: Awaited<ReturnType<typeof connectionsApi.pathsForPort>>[number] }
  | { kind: "direct"; cable: NetBoxCable };

export const connectionsService = {
  ...connectionsApi,
  async loadCablePath(cable: NetBoxCable): Promise<CablePathSource> {
    const terminations = [...cable.a_terminations, ...cable.b_terminations];
    const interfaceTermination = terminations.find(
      (item) => item.object_type === "dcim.interface",
    );
    if (interfaceTermination) {
      return {
        kind: "trace",
        trace: await connectionsApi.traceInterface(interfaceTermination.object_id),
      };
    }

    const matchingPaths: CablePath[] = [];
    for (const termination of terminations) {
      if (termination.object_type === "dcim.interface") continue;
      const paths = await connectionsApi.pathsForPort(
        termination.object_type as Exclude<TerminationKind, "dcim.interface">,
        termination.object_id,
      );
      matchingPaths.push(
        ...paths.filter((item) => cableHasId(item.path, cable.id)),
      );
    }
    const path = matchingPaths.toSorted(
      (left, right) =>
        Number(right.is_complete) - Number(left.is_complete) ||
        Number(left.is_split) - Number(right.is_split) ||
        right.path.length - left.path.length,
    )[0];
    if (path) return { kind: "paths", path };
    return { kind: "direct", cable };
  },
};
