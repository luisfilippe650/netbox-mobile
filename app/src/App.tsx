import { useEffect, useMemo, useState } from "react";
import { useAccess } from "./context/AccessContext";
import Login from "./pages/login/Login";
import Home, { type DeleteKind } from "./pages/home/Home";
import ScannerPage from "./pages/scanner/Scanner";
import ObjectInfoPage from "./pages/devices/ObjectInfo/ObjectInfo";
import DevicesPage from "./pages/devices/Devices/Devices";
import type { DeviceSummary } from "./pages/devices/shared/devices-data";
import AddDevicePage, {
  type DeviceCreateInput,
} from "./pages/devices/AddDevice/AddDevice";
import AddDeviceTypePage, {
  type DeviceTypeCreateInput,
} from "./pages/devices/AddDeviceType/AddDeviceType";
import DeviceTypesPage from "./pages/devices/DeviceTypes/DeviceTypes";
import ManufacturersPage from "./pages/devices/Manufacturers/Manufacturers";
import DeviceFunctionsPage from "./pages/devices/DeviceFunctions/DeviceFunctions";
import RackInfoPage from "./pages/racks/RackInfo/RackInfo";
import AddRackPage, {
  type RackCreateInput,
} from "./pages/racks/AddRack/AddRack";
import AddRackGroupPage from "./pages/racks/AddRackGroup/AddRackGroup";
import RackGroupsPage from "./pages/racks/RackGroups/RackGroups";
import RackRolesPage from "./pages/racks/RackRoles/RackRoles";
import RackDetailsPage from "./pages/racks/RackDetails/RackDetails";
import type { RackSummary } from "./pages/racks/shared/data";
import SitesPage from "./pages/organization/Sites/Sites";
import LocationsPage from "./pages/organization/Locations/Locations";
import RegionsPage from "./pages/organization/Regions/Regions";
import type { OrganizationCreateInput } from "./pages/organization/OrganizationList/OrganizationList";
import {
  loadNetBoxData,
  mapDevice,
  mapDeviceRoles,
  mapLocations,
  mapManufacturers,
  mapRackRoles,
  mapRacks,
  mapRegions,
  mapSites,
  netbox,
  netboxClient,
  slugify,
  type NetBoxData,
} from "./services";
import "./utils/colors.css";

type Page =
  | "login"
  | "home"
  | "scanner"
  | "object-info"
  | "devices"
  | "device-types"
  | "add-device"
  | "add-device-type"
  | "manufacturers"
  | "device-functions"
  | "rack-info"
  | "rack-details"
  | "rack-groups"
  | "rack-roles"
  | "add-rack"
  | "add-rack-group"
  | "sites"
  | "locations"
  | "regions";

const emptyData: NetBoxData = {
  devices: [],
  deviceTypes: [],
  deviceRoles: [],
  manufacturers: [],
  racks: [],
  rackGroups: [],
  rackRoles: [],
  sites: [],
  locations: [],
  regions: [],
};

export default function App() {
  const { clearSessionAccess, setSessionAccess } = useAccess();
  const [page, setPage] = useState<Page>("login");
  const [data, setData] = useState<NetBoxData>(emptyData);
  const [selectedDevice, setSelectedDevice] = useState<DeviceSummary | null>(
    null,
  );
  const [selectedRack, setSelectedRack] = useState<RackSummary | null>(null);
  const [deviceTypeReturnPage, setDeviceTypeReturnPage] = useState<
    "devices" | "device-types" | "add-device"
  >("devices");
  const [rackGroupReturnPage, setRackGroupReturnPage] = useState<
    "home" | "rack-groups"
  >("home");
  const [checkingSession, setCheckingSession] = useState(true);
  const [appError, setAppError] = useState("");

  const devices = useMemo(
    () =>
      data.devices.map((device) =>
        mapDevice(
          device,
          data.deviceTypes.find((item) => item.id === device.device_type.id),
        ),
      ),
    [data.deviceTypes, data.devices],
  );
  const sites = useMemo(() => mapSites(data.sites), [data.sites]);
  const locations = useMemo(
    () => mapLocations(data.locations),
    [data.locations],
  );
  const regions = useMemo(() => mapRegions(data.regions), [data.regions]);
  const manufacturers = useMemo(
    () => mapManufacturers(data.manufacturers),
    [data.manufacturers],
  );
  const deviceRoles = useMemo(
    () => mapDeviceRoles(data.deviceRoles),
    [data.deviceRoles],
  );
  const rackRoles = useMemo(
    () => mapRackRoles(data.rackRoles),
    [data.rackRoles],
  );
  const racks = useMemo(
    () => mapRacks(data.racks, devices),
    [data.racks, devices],
  );

  const refresh = async () => {
    const nextData = await loadNetBoxData();
    setData(nextData);
    return nextData;
  };

  const openPage = (nextPage: Page) => {
    if (nextPage === "add-device-type") setDeviceTypeReturnPage("devices");
    setPage(nextPage);
  };

  const applySessionAccess = async (
    user: Awaited<ReturnType<typeof netboxClient.login>>,
  ) => {
    let unrestricted = false;
    try {
      const metadata = await netboxClient.options("/users/permissions/");
      const actions = metadata.actions;
      unrestricted =
        typeof actions === "object" && actions !== null && "POST" in actions;
    } catch {
      unrestricted = false;
    }
    setSessionAccess(user, unrestricted);
  };

  useEffect(() => {
    void (async () => {
      try {
        const user = await netboxClient.restoreSession();
        if (user) {
          await applySessionAccess(user);
          await refresh();
          setPage("home");
        }
      } catch (error) {
        setAppError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o NetBox.",
        );
      } finally {
        setCheckingSession(false);
      }
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const user = await netboxClient.login(username, password);
    try {
      await applySessionAccess(user);
      await refresh();
      setAppError("");
      setPage("home");
    } catch (error) {
      try {
        await netboxClient.logout();
      } catch {
        // O service já limpa a sessão local mesmo se a revogação remota falhar.
      }
      clearSessionAccess();
      throw error;
    }
  };

  const logout = async () => {
    try {
      await netboxClient.logout();
    } catch {
      netboxClient.clearSession();
    }
    clearSessionAccess();
    setData(emptyData);
    setSelectedDevice(null);
    setSelectedRack(null);
    setPage("login");
  };

  const createRole = async (name: string, input?: OrganizationCreateInput) => {
    await netbox.deviceRoles.create({
      name,
      slug: slugify(name),
      color: input?.color ?? "9e9e9e",
      vm_role: input?.vmRole ?? false,
      description: input?.description ?? "",
    });
    await refresh();
  };
  const createManufacturer = async (name: string, description = "") => {
    await netbox.manufacturers.create({
      name,
      slug: slugify(name),
      description,
    });
    await refresh();
  };

  const createDevice = async (input: DeviceCreateInput) => {
    await netbox.devices.create({
      name: input.name,
      serial: input.serial,
      asset_tag: input.assetTag || null,
      device_type: input.deviceTypeId,
      role: input.roleId,
      site: input.siteId,
      location: input.locationId,
      rack: input.rackId,
      position: input.rackId ? input.position : null,
      ...(input.rackId && input.position ? { face: "front" } : {}),
      status: "active",
      description: input.description,
      custom_fields: input.customFields,
    });
    await refresh();
    setPage("devices");
  };
  const createDeviceType = async (input: DeviceTypeCreateInput) => {
    await netbox.deviceTypes.create({
      manufacturer: input.manufacturerId,
      model: input.model,
      slug: slugify(input.model),
      u_height: input.height,
      description: input.description,
    });
    await refresh();
    setPage(deviceTypeReturnPage);
  };
  const updateDevice = async (
    draft: DeviceSummary,
    changedCustomFields: Record<string, unknown>,
  ) => {
    const response = await netbox.devices.update(draft.apiId, {
      name: draft.name,
      serial: draft.serial,
      asset_tag: draft.assetTag || null,
      description: draft.description,
      site: draft.siteId,
      location: draft.locationId,
      rack: draft.rackId,
      position:
        draft.rackId && draft.allocatedUnit > 0 ? draft.allocatedUnit : null,
      ...(draft.rackId && draft.allocatedUnit > 0 ? { face: "front" } : {}),
      ...(Object.keys(changedCustomFields).length > 0
        ? { custom_fields: changedCustomFields }
        : {}),
    });
    const updated = mapDevice(
      response,
      data.deviceTypes.find((item) => item.id === response.device_type.id),
    );
    await refresh();
    setSelectedDevice(updated);
    return updated;
  };
  const deleteDevices = async (ids: number[]) => {
    await Promise.all(ids.map((id) => netbox.devices.delete(id)));
    await refresh();
  };
  const deleteDeviceTypes = async (ids: number[]) => {
    await Promise.all(ids.map((id) => netbox.deviceTypes.delete(id)));
    await refresh();
  };

  const createRack = async (input: RackCreateInput) => {
    await netbox.racks.create({
      name: input.name,
      site: input.siteId,
      location: input.locationId,
      group: input.groupId,
      role: input.roleId,
      status: "active",
      width: input.width,
      u_height: input.height,
      starting_unit: input.startingUnit,
      description: input.description,
    });
    await refresh();
    setPage("rack-info");
  };
  const deleteRacks = async (ids: number[]) => {
    await Promise.all(ids.map((id) => netbox.racks.delete(id)));
    await refresh();
  };
  const createRackGroup = async (name: string, description: string) => {
    await netbox.rackGroups.create({ name, slug: slugify(name), description });
    await refresh();
    setPage(rackGroupReturnPage);
  };
  const deleteRackGroups = async (ids: number[]) => {
    await Promise.all(ids.map((id) => netbox.rackGroups.delete(id)));
    await refresh();
  };
  const createRackRole = async (input: OrganizationCreateInput) => {
    await netbox.rackRoles.create({
      name: input.name,
      slug: slugify(input.name),
      color: input.color ?? "9e9e9e",
      description: input.description,
    });
    await refresh();
  };
  const createRackGroupQuick = async (name: string) => {
    const created = await netbox.rackGroups.create({
      name,
      slug: slugify(name),
      description: "",
    });
    await refresh();
    return created.id;
  };
  const createRackRoleQuick = async (
    name: string,
    color: OrganizationCreateInput["color"],
  ) => {
    const created = await netbox.rackRoles.create({
      name,
      slug: slugify(name),
      color: color ?? "9e9e9e",
      description: "",
    });
    await refresh();
    return created.id;
  };
  const deleteRackRoles = async (ids: number[]) => {
    await Promise.all(ids.map((id) => netbox.rackRoles.delete(id)));
    await refresh();
  };

  const createOrganization = async (
    kind: "site" | "location" | "region" | "manufacturer" | "role",
    input: OrganizationCreateInput,
  ) => {
    if (kind === "site")
      await netbox.sites.create({
        name: input.name,
        slug: slugify(input.name),
        status: "active",
        region: input.regionId ?? null,
        description: input.description,
      });
    if (kind === "location")
      await netbox.locations.create({
        name: input.name,
        slug: slugify(input.name),
        status: "active",
        site: input.siteId,
        description: input.description,
      });
    if (kind === "region")
      await netbox.regions.create({
        name: input.name,
        slug: slugify(input.name),
        description: input.description,
      });
    if (kind === "manufacturer")
      await createManufacturer(input.name, input.description);
    if (kind === "role") await createRole(input.name, input);
    if (kind !== "manufacturer" && kind !== "role") await refresh();
  };

  const deleteOrganization = async (
    kind: "site" | "location" | "region" | "manufacturer" | "role",
    ids: number[],
  ) => {
    const remove = {
      site: netbox.sites.delete,
      location: netbox.locations.delete,
      region: netbox.regions.delete,
      manufacturer: netbox.manufacturers.delete,
      role: netbox.deviceRoles.delete,
    }[kind];
    await Promise.all(ids.map((id) => remove(id)));
    await refresh();
  };

  const deleteFromHome = async (kind: DeleteKind, id: number) => {
    if (kind === "rack") await netbox.racks.delete(id);
    await refresh();
  };

  if (checkingSession)
    return (
      <main className="app-state">
        <strong>Conectando ao NetBox…</strong>
      </main>
    );
  if (page === "login") return <Login onLogin={login} />;

  if (page === "home")
    return (
      <Home
        onLogout={() => void logout()}
        devices={devices}
        racks={data.racks}
        onDelete={deleteFromHome}
        onSelectDevice={(device) => {
          setSelectedDevice(device);
          setPage("object-info");
        }}
        onOpenPage={openPage}
      />
    );

  if (page === "scanner")
    return (
      <ScannerPage
        onBack={() => setPage("home")}
        onOpenDevice={(id) => {
          const device = devices.find((item) => item.id === id);
          if (device) {
            setSelectedDevice(device);
            setPage("object-info");
          } else {
            setAppError(`Nenhum equipamento com o ID ${id} foi encontrado.`);
            setPage("devices");
          }
        }}
      />
    );

  if (page === "object-info" && selectedDevice)
    return (
      <ObjectInfoPage
        device={selectedDevice}
        sites={sites}
        racks={data.racks}
        loadCustomFields={netbox.customFields.listForDevices}
        onUpdate={updateDevice}
        onBack={() => setPage("devices")}
      />
    );
  if (page === "object-info")
    return (
      <DevicesPage
        items={devices}
        onDelete={deleteDevices}
        onBack={() => setPage("home")}
        onAdd={() => setPage("add-device")}
        onSelect={(device) => {
          setSelectedDevice(device);
          setPage("object-info");
        }}
      />
    );

  if (page === "devices")
    return (
      <>
        <DevicesPage
          items={devices}
          onDelete={deleteDevices}
          onBack={() => {
            setAppError("");
            setPage("home");
          }}
          onAdd={() => setPage("add-device")}
          onSelect={(device) => {
            setSelectedDevice(device);
            setPage("object-info");
          }}
        />
        {appError ? (
          <p className="app-toast" role="alert">
            {appError}
          </p>
        ) : null}
      </>
    );
  if (page === "device-types")
    return (
      <DeviceTypesPage
        items={data.deviceTypes}
        onDelete={deleteDeviceTypes}
        onAdd={() => {
          setDeviceTypeReturnPage("device-types");
          setPage("add-device-type");
        }}
        onBack={() => setPage("home")}
      />
    );
  if (page === "add-device")
    return (
      <AddDevicePage
        sites={sites}
        locations={locations}
        roles={data.deviceRoles}
        deviceTypes={data.deviceTypes}
        racks={data.racks}
        loadCustomFields={netbox.customFields.listForDeviceCreation}
        onCreate={createDevice}
        onCreateRole={(name, color) =>
          createRole(name, { name, description: "", color })
        }
        onCreateDeviceType={() => {
          setDeviceTypeReturnPage("add-device");
          setPage("add-device-type");
        }}
        onBack={() => setPage("devices")}
      />
    );
  if (page === "add-device-type")
    return (
      <AddDeviceTypePage
        manufacturers={data.manufacturers}
        onCreate={createDeviceType}
        onCreateManufacturer={createManufacturer}
        onBack={() => setPage(deviceTypeReturnPage)}
      />
    );
  if (page === "manufacturers")
    return (
      <ManufacturersPage
        items={manufacturers}
        onCreate={(input) => createOrganization("manufacturer", input)}
        onDelete={(ids) => deleteOrganization("manufacturer", ids)}
        onBack={() => setPage("home")}
      />
    );
  if (page === "device-functions")
    return (
      <DeviceFunctionsPage
        items={deviceRoles}
        onCreate={(input) => createOrganization("role", input)}
        onDelete={(ids) => deleteOrganization("role", ids)}
        onBack={() => setPage("home")}
      />
    );
  if (page === "rack-info")
    return (
      <RackInfoPage
        items={racks}
        onAdd={() => setPage("add-rack")}
        onDelete={deleteRacks}
        onBack={() => setPage("home")}
        onSelect={(rack) => {
          setSelectedRack(rack);
          setPage("rack-details");
        }}
      />
    );
  if (page === "rack-details" && selectedRack)
    return (
      <RackDetailsPage
        rack={selectedRack}
        onBack={() => setPage("rack-info")}
      />
    );
  if (page === "rack-groups")
    return (
      <RackGroupsPage
        items={data.rackGroups}
        onDelete={deleteRackGroups}
        onAdd={() => {
          setRackGroupReturnPage("rack-groups");
          setPage("add-rack-group");
        }}
        onBack={() => setPage("home")}
      />
    );
  if (page === "rack-roles")
    return (
      <RackRolesPage
        items={rackRoles}
        onCreate={createRackRole}
        onDelete={deleteRackRoles}
        onBack={() => setPage("home")}
      />
    );
  if (page === "add-rack")
    return (
      <AddRackPage
        sites={sites}
        locations={locations}
        groups={data.rackGroups}
        roles={data.rackRoles}
        onCreate={createRack}
        onCreateGroup={createRackGroupQuick}
        onCreateRole={createRackRoleQuick}
        onBack={() => setPage("home")}
      />
    );
  if (page === "add-rack-group")
    return (
      <AddRackGroupPage
        onCreate={createRackGroup}
        onBack={() => setPage(rackGroupReturnPage)}
      />
    );
  if (page === "sites")
    return (
      <SitesPage
        items={sites}
        regions={regions}
        onCreate={(input) => createOrganization("site", input)}
        onDelete={(ids) => deleteOrganization("site", ids)}
        onBack={() => setPage("home")}
      />
    );
  if (page === "locations")
    return (
      <LocationsPage
        items={locations}
        sites={sites}
        onCreate={(input) => createOrganization("location", input)}
        onDelete={(ids) => deleteOrganization("location", ids)}
        onBack={() => setPage("home")}
      />
    );
  if (page === "regions")
    return (
      <RegionsPage
        items={regions}
        onCreate={(input) => createOrganization("region", input)}
        onDelete={(ids) => deleteOrganization("region", ids)}
        onBack={() => setPage("home")}
      />
    );
  return null;
}
