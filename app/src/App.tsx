import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAccess } from "./context/AccessContext";
import { hasObjectAccess } from "./context/access-control";
import Login from "./pages/login/Login";
import Home, { type DeleteKind } from "./pages/home/Home";
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
import type {
  OrganizationCreateInput,
  OrganizationItem,
} from "./pages/organization/OrganizationList/OrganizationList";
import {
  deleteResources,
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
  type NetBoxDataKey,
} from "./services";
import type {
  PageRequest,
  PageResult,
} from "./hooks/usePaginatedData";
import "./utils/colors.css";

// Scanner e geração de QR code carregam bibliotecas relativamente grandes.
// Separá-los mantém a tela inicial leve sem perder o funcionamento offline do APK.
const ScannerPage = lazy(() => import("./pages/scanner/Scanner"));
const ObjectInfoPage = lazy(
  () => import("./pages/devices/ObjectInfo/ObjectInfo"),
);

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

const initialDataKeys: NetBoxDataKey[] = [];

const pageDataKeys: Partial<Record<Page, NetBoxDataKey[]>> = {
  "object-info": ["deviceTypes", "sites", "racks"],
  "add-device": [
    "deviceTypes",
    "deviceRoles",
    "sites",
    "locations",
    "racks",
  ],
  "add-device-type": ["manufacturers"],
  "add-rack": ["sites", "locations", "rackGroups", "rackRoles"],
  "rack-info": ["devices", "deviceTypes"],
  sites: ["regions"],
  locations: ["sites"],
};

const pageLoadingFallback = (
  <main className="app-state">
    <strong>Carregando página…</strong>
  </main>
);

export default function App() {
  const {
    clearSessionAccess,
    isUnrestricted,
    setSessionAccess,
    user: sessionUser,
  } = useAccess();
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
  const [loadingPage, setLoadingPage] = useState(false);
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
  const loadPermittedData = useCallback(
    async (
      keys: readonly NetBoxDataKey[],
      user: NonNullable<typeof sessionUser>,
      unrestricted: boolean,
    ) =>
      loadNetBoxData(keys, (objectType) =>
        hasObjectAccess(user, unrestricted, objectType, "view"),
      ),
    [],
  );

  const reloadData = async (keys: readonly NetBoxDataKey[]) => {
    if (!sessionUser) return;
    const patch = await loadPermittedData(keys, sessionUser, isUnrestricted);
    setData((current) => ({ ...current, ...patch }));
  };

  const pageParameters = ({ limit, offset, q }: PageRequest) => ({
    limit,
    offset,
    ...(q ? { q } : {}),
  });

  const loadDevicesPage = async (
    request: PageRequest & { searchBy: "name" | "id" },
  ): Promise<PageResult<DeviceSummary>> => {
    const { q, searchBy, ...pagination } = request;
    const response = await netbox.devices.page({
      ...pagination,
      ...(q ? (searchBy === "id" ? { id: q } : { q }) : {}),
    });
    return {
      count: response.count,
      results: response.results.map((device) =>
        mapDevice(
          device,
          data.deviceTypes.find((item) => item.id === device.device_type.id),
        ),
      ),
    };
  };

  const mapOrganizationPage = async <T,>(
    request: PageRequest,
    loader: (parameters: ReturnType<typeof pageParameters>) => Promise<{
      count: number;
      results: T[];
    }>,
    mapper: (items: T[]) => OrganizationItem[],
  ): Promise<PageResult<OrganizationItem>> => {
    const response = await loader(pageParameters(request));
    return { count: response.count, results: mapper(response.results) };
  };

  const navigateTo = async (nextPage: Page) => {
    setLoadingPage(true);
    try {
      const keys = pageDataKeys[nextPage];
      if (keys) await reloadData(keys);
      setAppError("");
      setPage(nextPage);
    } catch (error) {
      setAppError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar esta página.",
      );
    } finally {
      setLoadingPage(false);
    }
  };

  const openPage = (nextPage: Page) => {
    if (nextPage === "add-device-type") setDeviceTypeReturnPage("devices");
    void navigateTo(nextPage);
  };

  const openDevice = async (device: DeviceSummary) => {
    setLoadingPage(true);
    try {
      if (!sessionUser) throw new Error("A sessão do NetBox expirou.");
      const patch = await loadPermittedData(
        pageDataKeys["object-info"] ?? [],
        sessionUser,
        isUnrestricted,
      );
      setData((current) => ({ ...current, ...patch }));
      const deviceType = patch.deviceTypes?.find(
        (item) => item.id === device.deviceTypeId,
      );
      setSelectedDevice({
        ...device,
        deviceTypeDescription:
          deviceType?.description || device.deviceTypeDescription,
      });
      setAppError("");
      setPage("object-info");
    } catch (error) {
      setAppError(
        error instanceof Error
          ? error.message
          : "Não foi possível abrir o equipamento.",
      );
    } finally {
      setLoadingPage(false);
    }
  };

  const openRack = async (rack: RackSummary) => {
    setLoadingPage(true);
    try {
      const canViewDevices =
        sessionUser &&
        hasObjectAccess(
          sessionUser,
          isUnrestricted,
          "dcim.device",
          "view",
        );
      const rackDevices = canViewDevices
        ? (await netbox.devices.list({ rack_id: rack.apiId }))
            .map((device) =>
              mapDevice(
                device,
                data.deviceTypes.find(
                  (deviceType) => deviceType.id === device.device_type.id,
                ),
              ),
            )
            .filter((device) => device.allocatedUnit > 0)
            .map((device) => ({
              id: device.id,
              apiId: device.apiId,
              name: device.name,
              role: device.role,
              startingUnit: device.allocatedUnit,
              height: device.height,
              status: device.status,
            }))
        : [];
      setSelectedRack({ ...rack, devices: rackDevices });
      setAppError("");
      setPage("rack-details");
    } catch (error) {
      setAppError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a ocupação do rack.",
      );
    } finally {
      setLoadingPage(false);
    }
  };

  const applySessionAccess = useCallback(
    async (user: Awaited<ReturnType<typeof netboxClient.login>>) => {
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
      return unrestricted;
    },
    [setSessionAccess],
  );

  useEffect(() => {
    void (async () => {
      try {
        const user = await netboxClient.restoreSession();
        if (user) {
          const unrestricted = await applySessionAccess(user);
          const nextData = await loadPermittedData(
            initialDataKeys,
            user,
            unrestricted,
          );
          setData({ ...emptyData, ...nextData });
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
  }, [applySessionAccess, loadPermittedData]);

  const login = async (username: string, password: string) => {
    const user = await netboxClient.login(username, password);
    try {
      const unrestricted = await applySessionAccess(user);
      const nextData = await loadPermittedData(
        initialDataKeys,
        user,
        unrestricted,
      );
      setData({ ...emptyData, ...nextData });
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
      await netboxClient.clearSession();
    }
    clearSessionAccess();
    setData(emptyData);
    setSelectedDevice(null);
    setSelectedRack(null);
    setPage("login");
  };

  const createRole = async (name: string, input?: OrganizationCreateInput) => {
    const created = await netbox.deviceRoles.create({
      name,
      slug: slugify(name),
      color: input?.color ?? "9e9e9e",
      vm_role: input?.vmRole ?? false,
      description: input?.description ?? "",
    });
    setData((current) => ({
      ...current,
      deviceRoles: [...current.deviceRoles, created],
    }));
  };
  const createManufacturer = async (name: string, description = "") => {
    const created = await netbox.manufacturers.create({
      name,
      slug: slugify(name),
      description,
    });
    setData((current) => ({
      ...current,
      manufacturers: [...current.manufacturers, created],
    }));
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
    setPage("devices");
  };
  const createDeviceType = async (input: DeviceTypeCreateInput) => {
    const created = await netbox.deviceTypes.create({
      manufacturer: input.manufacturerId,
      model: input.model,
      slug: slugify(input.model),
      u_height: input.height,
      description: input.description,
    });
    setData((current) => ({
      ...current,
      deviceTypes: [...current.deviceTypes, created],
    }));
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
    setSelectedDevice(updated);
    return updated;
  };
  const deleteDevices = (ids: number[]) =>
    deleteResources(ids, netbox.devices.delete, "equipamento");
  const deleteDeviceTypes = (ids: number[]) =>
    deleteResources(ids, netbox.deviceTypes.delete, "tipo de equipamento");

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
    setPage("rack-info");
  };
  const deleteRacks = (ids: number[]) =>
    deleteResources(ids, netbox.racks.delete, "rack");
  const createRackGroup = async (name: string, description: string) => {
    const created = await netbox.rackGroups.create({
      name,
      slug: slugify(name),
      description,
    });
    setData((current) => ({
      ...current,
      rackGroups: [...current.rackGroups, created],
    }));
    setPage(rackGroupReturnPage);
  };
  const deleteRackGroups = (ids: number[]) =>
    deleteResources(ids, netbox.rackGroups.delete, "grupo de rack");
  const createRackRole = async (input: OrganizationCreateInput) => {
    const created = await netbox.rackRoles.create({
      name: input.name,
      slug: slugify(input.name),
      color: input.color ?? "9e9e9e",
      description: input.description,
    });
    setData((current) => ({
      ...current,
      rackRoles: [...current.rackRoles, created],
    }));
  };
  const createRackGroupQuick = async (name: string) => {
    const created = await netbox.rackGroups.create({
      name,
      slug: slugify(name),
      description: "",
    });
    setData((current) => ({
      ...current,
      rackGroups: [...current.rackGroups, created],
    }));
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
    setData((current) => ({
      ...current,
      rackRoles: [...current.rackRoles, created],
    }));
    return created.id;
  };
  const deleteRackRoles = (ids: number[]) =>
    deleteResources(ids, netbox.rackRoles.delete, "função de rack");

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
    return deleteResources(ids, remove, "item");
  };

  const deleteFromHome = async (kind: DeleteKind, id: number) => {
    if (kind === "rack") {
      await netbox.racks.delete(id);
      setData((current) => ({
        ...current,
        racks: current.racks.filter((rack) => rack.id !== id),
      }));
    }
  };

  if (checkingSession || loadingPage)
    return (
      <main className="app-state">
        <strong>Conectando ao NetBox…</strong>
      </main>
    );
  if (page === "login")
    return <Login initialError={appError} onLogin={login} />;

  if (page === "home")
    return (
      <>
        <Home
          onLogout={() => void logout()}
          searchDevices={async (searchBy, query) => {
            const result = await loadDevicesPage({
              limit: 10,
              offset: 0,
              q: query,
              searchBy,
            });
            return result.results;
          }}
          racks={data.racks}
          onDelete={deleteFromHome}
          onSelectDevice={(device) => void openDevice(device)}
          onOpenPage={openPage}
        />
        {appError ? (
          <p className="app-toast" role="alert">
            {appError}
          </p>
        ) : null}
      </>
    );

  if (page === "scanner")
    return (
      <Suspense fallback={pageLoadingFallback}>
        <ScannerPage
          onBack={() => setPage("home")}
          onOpenDevice={(id) => {
            void loadDevicesPage({
              limit: 1,
              offset: 0,
              q: id,
              searchBy: "id",
            })
              .then((result) => {
                const device = result.results[0];
                if (device) return openDevice(device);
                setAppError(`Nenhum equipamento com o ID ${id} foi encontrado.`);
                setPage("devices");
              })
              .catch((error: unknown) => {
                setAppError(
                  error instanceof Error
                    ? error.message
                    : "Não foi possível buscar o equipamento.",
                );
                setPage("devices");
              });
          }}
        />
      </Suspense>
    );

  if (page === "object-info" && selectedDevice)
    return (
      <Suspense fallback={pageLoadingFallback}>
        <ObjectInfoPage
          device={selectedDevice}
          sites={sites}
          racks={data.racks}
          loadCustomFields={netbox.customFields.listForDevices}
          onUpdate={updateDevice}
          onBack={() => setPage("devices")}
        />
      </Suspense>
    );
  if (page === "object-info")
    return (
      <DevicesPage
        loadPage={loadDevicesPage}
        onDelete={deleteDevices}
        onBack={() => setPage("home")}
        onAdd={() => void navigateTo("add-device")}
        onSelect={(device) => void openDevice(device)}
      />
    );

  if (page === "devices")
    return (
      <>
        <DevicesPage
          loadPage={loadDevicesPage}
          onDelete={deleteDevices}
          onBack={() => {
            setAppError("");
            setPage("home");
          }}
          onAdd={() => void navigateTo("add-device")}
          onSelect={(device) => void openDevice(device)}
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
        loadPage={(request) =>
          netbox.deviceTypes.page(pageParameters(request))
        }
        onDelete={deleteDeviceTypes}
        onAdd={() => {
          setDeviceTypeReturnPage("device-types");
          void navigateTo("add-device-type");
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
          void navigateTo("add-device-type");
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
        loadPage={(request) =>
          mapOrganizationPage(
            request,
            netbox.manufacturers.page,
            mapManufacturers,
          )
        }
        onCreate={(input) => createOrganization("manufacturer", input)}
        onDelete={(ids) => deleteOrganization("manufacturer", ids)}
        onBack={() => setPage("home")}
      />
    );
  if (page === "device-functions")
    return (
      <DeviceFunctionsPage
        loadPage={(request) =>
          mapOrganizationPage(request, netbox.deviceRoles.page, mapDeviceRoles)
        }
        onCreate={(input) => createOrganization("role", input)}
        onDelete={(ids) => deleteOrganization("role", ids)}
        onBack={() => setPage("home")}
      />
    );
  if (page === "rack-info")
    return (
      <>
        <RackInfoPage
          loadPage={async (request) => {
            const response = await netbox.racks.page(pageParameters(request));
            return {
              count: response.count,
              results: mapRacks(response.results, devices),
            };
          }}
          onAdd={() => void navigateTo("add-rack")}
          onDelete={deleteRacks}
          onBack={() => setPage("home")}
          onSelect={(rack) => void openRack(rack)}
        />
        {appError ? (
          <p className="app-toast" role="alert">
            {appError}
          </p>
        ) : null}
      </>
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
        loadPage={(request) =>
          netbox.rackGroups.page(pageParameters(request))
        }
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
        loadPage={(request) =>
          mapOrganizationPage(request, netbox.rackRoles.page, mapRackRoles)
        }
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
        loadPage={(request) =>
          mapOrganizationPage(request, netbox.sites.page, mapSites)
        }
        regions={regions}
        onCreate={(input) => createOrganization("site", input)}
        onDelete={(ids) => deleteOrganization("site", ids)}
        onBack={() => setPage("home")}
      />
    );
  if (page === "locations")
    return (
      <LocationsPage
        loadPage={(request) =>
          mapOrganizationPage(request, netbox.locations.page, mapLocations)
        }
        sites={sites}
        onCreate={(input) => createOrganization("location", input)}
        onDelete={(ids) => deleteOrganization("location", ids)}
        onBack={() => setPage("home")}
      />
    );
  if (page === "regions")
    return (
      <RegionsPage
        loadPage={(request) =>
          mapOrganizationPage(request, netbox.regions.page, mapRegions)
        }
        onCreate={(input) => createOrganization("region", input)}
        onDelete={(ids) => deleteOrganization("region", ids)}
        onBack={() => setPage("home")}
      />
    );
  return null;
}
