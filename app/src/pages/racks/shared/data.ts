import type { RackSummary } from "../../../services/view_models";
export type { RackDevice, RackSummary } from "../../../services/view_models";

export function getOccupiedUnits(rack: RackSummary) {
  const intervals = rack.devices
    .map((device) => [
      Math.max(device.startingUnit, rack.startingUnit),
      Math.min(
        device.startingUnit + device.height,
        rack.startingUnit + rack.height,
      ),
    ])
    .sort((left, right) => left[0] - right[0]);
  let occupied = 0;
  let end = rack.startingUnit;
  for (const [start, stop] of intervals) {
    occupied += Math.max(0, stop - Math.max(start, end));
    end = Math.max(end, stop);
  }
  return occupied;
}

export function getRackOccupancyPercentage(rack: RackSummary) {
  if (rack.height <= 0) return 0;
  return Math.min(
    100,
    Math.max(0, Math.round((getOccupiedUnits(rack) / rack.height) * 100)),
  );
}

export function getPositionedRackDevices(
  rack: RackSummary,
  face: "front" | "rear" = "front",
) {
  const highestUnit = rack.startingUnit + rack.height - 1;
  return rack.devices.flatMap((device) => {
    if (
      !device.fullDepth &&
      (face === "front" ? device.face === "rear" : device.face !== "rear")
    )
      return [];
    const firstVisibleUnit = Math.max(device.startingUnit, rack.startingUnit);
    const lastVisibleUnit = Math.min(
      device.startingUnit + device.height - 1,
      highestUnit,
    );
    if (lastVisibleUnit < firstVisibleUnit) return [];
    return [
      {
        ...device,
        firstVisibleUnit,
        lastVisibleUnit,
        row: highestUnit - lastVisibleUnit + 1,
        visibleHeight: lastVisibleUnit - firstVisibleUnit + 1,
      },
    ];
  });
}
