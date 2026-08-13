export type DeviceSummary = {
  id: string;
  apiId: number;
  name: string;
  deviceTypeId: number;
  roleId: number;
  role: string;
  site: string;
  siteId: number;
  locationId: number | null;
  region: string;
  rack: string;
  rackId: number | null;
  allocatedUnit: number;
  height: number;
  status: string;
  label: string;
  description: string;
};
