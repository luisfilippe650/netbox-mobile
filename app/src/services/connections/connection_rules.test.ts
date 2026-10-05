import { describe, expect, it } from "vitest";
import {
  areTerminationsCompatible,
  buildCablePayload,
  directCableDiagram,
  isTerminationAvailable,
  normalizeCablePath,
  normalizeTrace,
} from "./connection_rules";
import type { CablePath, ConnectionTermination, NetBoxCable, TraceResponse } from "./connections_dto";

const device = (id: number, name: string) => ({ id, display: name, name });
const termination = (
  kind: ConnectionTermination["kind"],
  id: number,
  deviceId: number,
  name: string,
  occupied = false,
): ConnectionTermination => ({
  kind,
  id,
  display: name,
  device: device(deviceId, `Device ${deviceId}`),
  name,
  label: "",
  mark_connected: false,
  cable: null,
  link_peers: [],
  _occupied: occupied,
});

const source = termination("dcim.interface", 101, 10, "eth0");
const rear = {
  ...termination("dcim.rearport", 201, 20, "Rear 01"),
  front_ports: [{ position: 1, front_port: 202, front_port_position: 1 }],
};
const front = {
  ...termination("dcim.frontport", 202, 20, "Front 01"),
  rear_ports: [{ position: 1, rear_port: 201, rear_port_position: 1 }],
};
const destination = termination("dcim.interface", 301, 30, "Gi0/1");

const fullCable = (id: number): NetBoxCable => ({
  id,
  url: `http://netbox/api/dcim/cables/${id}/`,
  display: `#${id}`,
  a_terminations: [{ object_type: "dcim.interface", object_id: source.id, object: source }],
  b_terminations: [{ object_type: "dcim.rearport", object_id: rear.id, object: rear }],
  status: { value: "connected", label: "Connected" },
  label: "",
  color: "",
  length: null,
  description: "",
});

const tracedCable = (id: number) => ({
  id,
  url: `http://netbox/api/dcim/cables/${id}/`,
  status: { value: "connected" as const, label: "Connected" },
  label: `C${id}`,
  color: "",
  length: null,
  description: "",
});

describe("connection rules", () => {
  it("aceita somente terminações realmente livres", () => {
    expect(isTerminationAvailable(source)).toBe(true);
    expect(isTerminationAvailable({ ...source, _occupied: true })).toBe(false);
    expect(isTerminationAvailable({ ...source, mark_connected: true })).toBe(false);
  });

  it("impede selecionar o mesmo objeto nos dois lados", () => {
    expect(areTerminationsCompatible(source, rear)).toBe(true);
    expect(areTerminationsCompatible(source, { ...source })).toBe(false);
  });

  it("normaliza campos opcionais e exige unidade para comprimento", () => {
    expect(
      buildCablePayload(source, rear, {
        status: "connected",
        type: "cat6a",
        label: "  CAB-01 ",
        color: "#2196F3",
        length: 12.5,
        lengthUnit: "m",
        description: "  trecho A ",
      }),
    ).toEqual({
      a_terminations: [{ object_type: "dcim.interface", object_id: 101 }],
      b_terminations: [{ object_type: "dcim.rearport", object_id: 201 }],
      status: "connected",
      type: "cat6a",
      label: "CAB-01",
      color: "2196f3",
      length: 12.5,
      length_unit: "m",
      description: "trecho A",
    });
    expect(() => buildCablePayload(source, rear, { status: "connected", length: 2 })).toThrow(/unidade/i);
  });

  it("monta caminho com pass-through a partir do trace real", () => {
    const asTrace = (item: ConnectionTermination) => ({
      ...item,
      url: `http://netbox/api/dcim/${item.kind === "dcim.interface" ? "interfaces" : item.kind === "dcim.frontport" ? "front-ports" : "rear-ports"}/${item.id}/`,
    });
    const trace: TraceResponse = [
      [[asTrace(source)], tracedCable(1), [asTrace(rear)]],
      [[asTrace(front)], tracedCable(2), [asTrace(destination)]],
    ];

    const nodes = normalizeTrace(trace);

    expect(nodes.map((node) => node.kind)).toEqual([
      "device",
      "termination",
      "cable",
      "pass-through",
      "cable",
      "termination",
      "device",
    ]);
  });

  it("normaliza a sequência real de CablePath sem depender de uma interface", () => {
    const nested = (item: ConnectionTermination) => ({
      id: item.id,
      url: `http://netbox/api/dcim/${item.kind === "dcim.frontport" ? "front-ports" : "rear-ports"}/${item.id}/`,
      display: item.name,
      device: item.device,
      name: item.name,
    });
    const path: CablePath = {
      id: 7,
      path: [
        [nested(front)],
        [tracedCable(2)],
        [nested(rear)],
        [nested(front)],
        [tracedCable(3)],
        [nested(rear)],
      ],
      is_active: true,
      is_complete: true,
      is_split: false,
    };

    const nodes = normalizeCablePath(path);

    expect(nodes.filter((node) => node.kind === "cable")).toHaveLength(2);
    expect(nodes.some((node) => node.kind === "pass-through")).toBe(true);
    expect(nodes.at(-1)?.kind).toBe("device");
  });

  it("sinaliza trace incompleto em vez de inventar destino", () => {
    const trace: TraceResponse = [[[{ ...source, url: "http://netbox/api/dcim/interfaces/101/" }], tracedCable(1), []]];
    expect(normalizeTrace(trace).at(-1)).toMatchObject({ kind: "notice", tone: "warning" });
  });

  it("gera fallback direto para cabo sem CablePath", () => {
    expect(directCableDiagram(fullCable(8)).some((node) => node.kind === "cable")).toBe(true);
  });
});
