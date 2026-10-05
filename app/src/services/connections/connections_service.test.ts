import { afterEach, expect, it, vi } from "vitest";
import { connectionsApi } from "./connections_api";
import { connectionsService } from "./connections_service";
import type { CablePath, NetBoxCable } from "./connections_dto";

const cable = {
  id: 42,
  url: "http://netbox/api/dcim/cables/42/",
  display: "CAB-42",
  a_terminations: [
    { object_type: "dcim.rearport", object_id: 10, object: null },
  ],
  b_terminations: [
    { object_type: "dcim.frontport", object_id: 20, object: null },
  ],
  status: { value: "connected", label: "Connected" },
  label: "CAB-42",
  color: "",
  length: null,
  description: "",
} as NetBoxCable;

const path = (
  id: number,
  isComplete: boolean,
  length: number,
): CablePath => ({
  id,
  path: Array.from({ length }, (_, index) => [
    index === 1
      ? { id: 42, status: { value: "connected", label: "Connected" } }
      : { id: index + 100 },
  ]),
  is_active: true,
  is_complete: isComplete,
  is_split: false,
});

afterEach(() => vi.restoreAllMocks());

it("prioriza o CablePath completo e mais longo que contém o cabo", async () => {
  const incomplete = path(1, false, 3);
  const complete = path(2, true, 6);
  vi.spyOn(connectionsApi, "pathsForPort").mockResolvedValue([
    incomplete,
    complete,
  ]);

  await expect(connectionsService.loadCablePath(cable)).resolves.toEqual({
    kind: "paths",
    path: complete,
  });
});
