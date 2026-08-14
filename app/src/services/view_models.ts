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
  serial: string;
  assetTag: string;
  description: string;
  deviceType: string;
  deviceTypeDescription: string;
  manufacturer: string;
  primaryIp4: string | null;
  primaryIp6: string | null;
  customFields: Record<string, unknown>;
};

export type OrganizationSummary = {
  id: string;
  name: string;
  description: string;
  detail: string;
  region?: string;
  regionId?: number | null;
  tenant?: string;
  timezone?: string;
  site?: string;
  siteId?: number;
  vmRole?: boolean;
  color?: string;
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
  width: number;
  devices: readonly {
    id: string;
    apiId: number;
    name: string;
    role: string;
    startingUnit: number;
    height: number;
    status: string;
  }[];
};
