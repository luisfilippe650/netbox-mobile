export type RackDevice = {
  id: string;
  apiId: number;
  name: string;
  role: string;
  startingUnit: number;
  height: number;
  status: string;
};

export type RackSummary = {
  id: string;
  apiId: number;
  name: string;
  site: string;
  location: string;
  group: string;
  role: string;
  height: number;
  startingUnit: number;
  width: number;
  devices: readonly RackDevice[];
};

export function getOccupiedUnits(rack: RackSummary) {
  return rack.devices.reduce((total, device) => total + device.height, 0);
}

export function getRackOccupancyPercentage(rack: RackSummary) {
  if (rack.height <= 0) return 0;
  return Math.min(
    100,
    Math.max(0, Math.round((getOccupiedUnits(rack) / rack.height) * 100)),
  );
}

export function getPositionedRackDevices(rack: RackSummary) {
  const highestUnit = rack.startingUnit + rack.height - 1;
  return rack.devices.flatMap((device) => {
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
