import {
  cableCreateSchema,
  tracedCableSchema,
  type CablePath,
  type CableCreate,
  type ConnectionTermination,
  type NetBoxCable,
  type TraceResponse,
  type TracedCable,
  type TerminationKind,
} from "./connections_dto";

export type DiagramCable = NetBoxCable | TracedCable;

export type ConnectionDiagramNode =
  | { kind: "device"; deviceId: number; label: string }
  | { kind: "termination"; termination: ConnectionTermination }
  | { kind: "cable"; cable: DiagramCable }
  | {
      kind: "pass-through";
      deviceId: number;
      label: string;
      front: ConnectionTermination;
      rear: ConnectionTermination;
    }
  | { kind: "notice"; tone: "warning" | "neutral"; label: string };

export type CableFormValues = {
  status: CableCreate["status"];
  type?: string;
  label?: string;
  color?: string;
  length?: number;
  lengthUnit?: CableCreate["length_unit"];
  description?: string;
};

function cableId(termination: ConnectionTermination) {
  return typeof termination.cable === "number"
    ? termination.cable
    : termination.cable?.id;
}

export function isTerminationAvailable(termination: ConnectionTermination) {
  return (
    !termination._occupied &&
    !termination.mark_connected &&
    !cableId(termination) &&
    !termination.wireless_link &&
    termination.enabled !== false
  );
}

export function areTerminationsCompatible(
  left: ConnectionTermination,
  right: ConnectionTermination,
) {
  return !(left.kind === right.kind && left.id === right.id);
}

export function buildCablePayload(
  left: ConnectionTermination,
  right: ConnectionTermination,
  values: CableFormValues,
) {
  const optionalText = (value?: string) => value?.trim() || undefined;
  const color = values.color?.replace(/^#/, "").toLocaleLowerCase("en-US");
  return cableCreateSchema.parse({
    a_terminations: [{ object_type: left.kind, object_id: left.id }],
    b_terminations: [{ object_type: right.kind, object_id: right.id }],
    status: values.status,
    type: optionalText(values.type),
    label: optionalText(values.label),
    color: optionalText(color),
    length: values.length,
    length_unit: values.length === undefined ? undefined : values.lengthUnit,
    description: optionalText(values.description),
  });
}

function inferKind(url?: string): TerminationKind {
  if (url?.includes("/front-ports/")) return "dcim.frontport";
  if (url?.includes("/rear-ports/")) return "dcim.rearport";
  return "dcim.interface";
}

function traceTermination(
  termination: TraceResponse[number][0][number],
): ConnectionTermination {
  return { ...termination, kind: inferKind(termination.url) };
}

function addSide(
  nodes: ConnectionDiagramNode[],
  terminations: ConnectionTermination[],
  deviceFirst: boolean,
) {
  if (terminations.length > 1) {
    nodes.push({
      kind: "notice",
      tone: "neutral",
      label: `${terminations.length} terminações neste lado`,
    });
  }
  terminations.forEach((termination) => {
    const device: ConnectionDiagramNode = {
      kind: "device",
      deviceId: termination.device.id,
      label: termination.device.name ?? termination.device.display,
    };
    const port: ConnectionDiagramNode = { kind: "termination", termination };
    nodes.push(...(deviceFirst ? [device, port] : [port, device]));
  });
}

function passThrough(
  left: ConnectionTermination,
  right: ConnectionTermination,
  pathConfirmed = false,
): Extract<ConnectionDiagramNode, { kind: "pass-through" }> | null {
  if (left.device.id !== right.device.id) return null;
  const rear = left.kind === "dcim.rearport" ? left : right.kind === "dcim.rearport" ? right : null;
  const front = left.kind === "dcim.frontport" ? left : right.kind === "dcim.frontport" ? right : null;
  if (!rear || !front) return null;
  const mapped =
    pathConfirmed ||
    rear.front_ports?.some((item) => item.front_port === front.id) ||
    front.rear_ports?.some((item) => item.rear_port === rear.id);
  if (!mapped) return null;
  return {
    kind: "pass-through",
    deviceId: rear.device.id,
    label: rear.device.name ?? rear.device.display,
    front,
    rear,
  };
}

function cablePathTermination(
  value: Record<string, unknown>,
): ConnectionTermination | null {
  const url = typeof value.url === "string" ? value.url : undefined;
  if (
    !url?.includes("/interfaces/") &&
    !url?.includes("/front-ports/") &&
    !url?.includes("/rear-ports/")
  )
    return null;
  const device = value.device;
  if (!device || typeof device !== "object") return null;
  const deviceRecord = device as Record<string, unknown>;
  if (typeof value.id !== "number" || typeof deviceRecord.id !== "number")
    return null;
  const display = String(value.display ?? value.name ?? `Porta #${value.id}`);
  return {
    id: value.id,
    url,
    display,
    device: {
      id: deviceRecord.id,
      display: String(
        deviceRecord.display ??
          deviceRecord.name ??
          `Dispositivo #${deviceRecord.id}`,
      ),
      name:
        typeof deviceRecord.name === "string" ? deviceRecord.name : null,
    },
    name: String(value.name ?? display),
    label: typeof value.label === "string" ? value.label : "",
    mark_connected: false,
    cable: null,
    link_peers: [],
    _occupied: true,
    kind: inferKind(url),
  } satisfies ConnectionTermination;
}

function cablePathTerminations(group: Record<string, unknown>[] = []) {
  return group
    .map(cablePathTermination)
    .filter((item): item is ConnectionTermination => item !== null);
}

function cablePathCables(group: Record<string, unknown>[] = []) {
  return group.flatMap((item) => {
    const parsed = tracedCableSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function normalizeCablePath(
  cablePath: CablePath,
): ConnectionDiagramNode[] {
  const start = cablePathTerminations(cablePath.path[0]);
  if (!start.length)
    return [
      {
        kind: "notice",
        tone: "warning",
        label: "O NetBox retornou um CablePath sem origem compatível.",
      },
    ];

  const nodes: ConnectionDiagramNode[] = [];
  addSide(nodes, start, true);
  let index = 1;
  while (index < cablePath.path.length) {
    const cables = cablePathCables(cablePath.path[index]);
    if (!cables.length) {
      nodes.push({
        kind: "notice",
        tone: "warning",
        label: "O caminho contém um trecho que não pôde ser interpretado.",
      });
      break;
    }
    if (cables.length > 1)
      nodes.push({
        kind: "notice",
        tone: "neutral",
        label: `${cables.length} cabos paralelos neste trecho`,
      });
    cables.forEach((cable) => nodes.push({ kind: "cable", cable }));

    const far = cablePathTerminations(cablePath.path[index + 1]);
    if (!far.length) {
      nodes.push({
        kind: "notice",
        tone: "warning",
        label: "Caminho incompleto: nenhuma terminação foi encontrada.",
      });
      break;
    }

    const nextNear = cablePathTerminations(cablePath.path[index + 2]);
    if (nextNear.length) {
      const mapped =
        far.length === 1 && nextNear.length === 1
          ? passThrough(far[0], nextNear[0], true)
          : null;
      if (mapped) nodes.push(mapped);
      else {
        addSide(nodes, far, false);
        nodes.push({
          kind: "notice",
          tone: "warning",
          label: "O caminho possui uma divisão ou passagem não suportada.",
        });
        addSide(nodes, nextNear, true);
      }
      index += 3;
    } else {
      addSide(nodes, far, false);
      index += 2;
    }
  }
  return nodes;
}

export function normalizeTrace(trace: TraceResponse): ConnectionDiagramNode[] {
  if (trace.length === 0)
    return [{ kind: "notice", tone: "warning", label: "Nenhum caminho físico foi encontrado." }];

  const nodes: ConnectionDiagramNode[] = [];
  addSide(nodes, trace[0][0].map(traceTermination), true);

  trace.forEach((segment, index) => {
    const [, cable, farRaw] = segment;
    if (cable) nodes.push({ kind: "cable", cable });
    else nodes.push({ kind: "notice", tone: "neutral", label: "Ligação interna sem cabo" });

    const far = farRaw.map(traceTermination);
    const nextNear = trace[index + 1]?.[0].map(traceTermination) ?? [];
    if (index < trace.length - 1) {
      const mapped = far.length === 1 && nextNear.length === 1
        ? passThrough(far[0], nextNear[0])
        : null;
      if (mapped) nodes.push(mapped);
      else {
        if (far.length) addSide(nodes, far, false);
        nodes.push({ kind: "notice", tone: "warning", label: "O caminho possui uma divisão ou passagem não mapeada." });
        if (nextNear.length) addSide(nodes, nextNear, true);
      }
    } else if (far.length) addSide(nodes, far, false);
    else nodes.push({ kind: "notice", tone: "warning", label: "Caminho incompleto: nenhuma terminação final foi encontrada." });
  });
  return nodes;
}

function objectTermination(
  reference: NetBoxCable["a_terminations"][number],
): ConnectionTermination | null {
  return reference.object
    ? { ...reference.object, kind: reference.object_type }
    : null;
}

export function directCableDiagram(cable: NetBoxCable): ConnectionDiagramNode[] {
  const left = cable.a_terminations.map(objectTermination).filter((item): item is ConnectionTermination => item !== null);
  const right = cable.b_terminations.map(objectTermination).filter((item): item is ConnectionTermination => item !== null);
  const nodes: ConnectionDiagramNode[] = [];
  if (left.length) addSide(nodes, left, true);
  nodes.push({ kind: "cable", cable });
  if (right.length) addSide(nodes, right, false);
  if (!left.length || !right.length)
    nodes.push({ kind: "notice", tone: "warning", label: "O NetBox não retornou todas as terminações deste cabo." });
  return nodes;
}

export function terminationDeviceId(termination: ConnectionTermination) {
  return termination.device.id;
}
