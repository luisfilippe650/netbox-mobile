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
  height: number;
  width: number;
  devices: readonly RackDevice[];
};

export function getOccupiedUnits(rack: RackSummary) {
  return rack.devices.reduce((total, device) => total + device.height, 0);
}
