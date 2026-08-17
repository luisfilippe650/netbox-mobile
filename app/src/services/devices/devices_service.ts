import {
  deviceRolesApi,
  devicesApi,
  deviceTypesApi,
  manufacturersApi,
  customFieldsApi,
} from "./devices_api";
import type {
  NetBoxCustomFieldChoice,
  DeviceCustomFieldDefinition,
  NetBoxDevice,
  NetBoxDeviceRole,
  NetBoxDeviceType,
  NetBoxManufacturer,
} from "./devices_dto";
import type { DeviceSummary, OrganizationSummary } from "../view_models";

// Expõe as APIs com nomes de domínio para que os consumidores dependam da
// camada de service, e não diretamente da implementação HTTP.
export const devicesService = devicesApi;
export const deviceTypesService = deviceTypesApi;
export const deviceRolesService = deviceRolesApi;
export const manufacturersService = manufacturersApi;
async function loadDeviceCustomFields(
  requireRelatedData: boolean,
): Promise<DeviceCustomFieldDefinition[]> {
  const fields = await customFieldsApi.listForDevices();
  const needsInputData = (field: (typeof fields)[number]) =>
    requireRelatedData &&
    field.ui_visible.value !== "hidden" &&
    field.ui_editable.value === "yes";
  const hasRelatedFields = fields.some(
    (field) =>
      field.related_object_type &&
      (!requireRelatedData || needsInputData(field)),
  );
  let objectTypes: Awaited<ReturnType<typeof customFieldsApi.listObjectTypes>> =
    [];
  if (hasRelatedFields) {
    try {
      objectTypes = await customFieldsApi.listObjectTypes();
    } catch (error) {
      if (requireRelatedData) {
        throw new Error(
          "Não foi possível carregar os tipos de objetos dos campos personalizados.",
          { cause: error },
        );
      }
    }
  }

  return Promise.all(
    fields.map(async (field) => {
      const mustLoadInputData = needsInputData(field);
      let choices: NetBoxCustomFieldChoice[] = [];
      let relatedObjects: DeviceCustomFieldDefinition["relatedObjects"] = [];
      if (field.choice_set) {
        try {
          choices = await customFieldsApi.listChoices(field.choice_set.id);
        } catch (error) {
          if (mustLoadInputData) {
            throw new Error(
              `Não foi possível carregar as opções do campo “${field.label || field.name}”.`,
              { cause: error },
            );
          }
          // O campo continua visível mesmo se as opções não estiverem acessíveis.
        }
      }
      if (field.related_object_type) {
        const objectType = objectTypes.find(
          (item) =>
            `${item.app_label}.${item.model}` === field.related_object_type,
        );
        if (objectType?.rest_api_endpoint) {
          const filters =
            typeof field.related_object_filter === "object" &&
            field.related_object_filter !== null
              ? Object.fromEntries(
                  Object.entries(field.related_object_filter).map(
                    ([key, value]) => [key, String(value)],
                  ),
                )
              : {};
          try {
            relatedObjects = await customFieldsApi.listRelatedObjects(
              objectType.rest_api_endpoint,
              filters,
            );
          } catch (error) {
            if (mustLoadInputData) {
              throw new Error(
                `Não foi possível carregar os objetos do campo “${field.label || field.name}”.`,
                { cause: error },
              );
            }
            // Mantém o valor atual disponível em modo de consulta.
          }
        } else if (mustLoadInputData) {
          throw new Error(
            `Não foi possível identificar o tipo de objeto do campo “${field.label || field.name}”.`,
          );
        }
      }
      return { ...field, choices, relatedObjects };
    }),
  );
}

export const customFieldsService = {
  listForDevices: () => loadDeviceCustomFields(false),
  listForDeviceCreation: () => loadDeviceCustomFields(true),
};

/**
 * Converte o valor estável retornado pela API no texto apresentado pela UI.
 * Valores novos do NetBox são preservados para que a interface não esconda
 * um status ainda não mapeado pelo aplicativo.
 */
function localizedStatus(value: string) {
  const labels: Record<string, string> = {
    active: "Ativo",
    planned: "Planejado",
    staged: "Preparação",
    failed: "Falha",
    offline: "Offline",
    decommissioning: "Desativação",
    inventory: "Inventário",
  };
  return labels[value] ?? value ?? "Não informado";
}

/**
 * Adapta um dispositivo do contrato do NetBox ao formato consumido pelas telas.
 * Além de normalizar IDs, concentra aqui os fallbacks para relacionamentos
 * opcionais, evitando que cada componente precise conhecer o DTO da API.
 */
export function mapDevice(
  device: NetBoxDevice,
  deviceType?: NetBoxDeviceType,
): DeviceSummary {
  return {
    id: String(device.id),
    apiId: device.id,
    name: device.name || device.display,
    deviceTypeId: device.device_type.id,
    roleId: device.role.id,
    role: device.role.name ?? device.role.display,
    site: device.site.name ?? device.site.display,
    siteId: device.site.id,
    locationId: device.location?.id ?? null,
    region:
      device.location?.name ??
      device.location?.display ??
      device.site.region?.name ??
      device.site.region?.display ??
      "Sem local",
    rack: device.rack?.name ?? device.rack?.display ?? "Sem rack",
    rackId: device.rack?.id ?? null,
    allocatedUnit: device.position ?? 0,
    height: deviceType?.u_height ?? device.device_type.u_height ?? 1,
    status: localizedStatus(device.status.value),
    label: device.asset_tag || device.serial || "Não informada",
    serial: device.serial,
    assetTag: device.asset_tag ?? "",
    description: device.description ?? "",
    deviceType: device.device_type.model ?? device.device_type.display,
    deviceTypeDescription: deviceType?.description || "Sem descrição",
    manufacturer:
      device.device_type.manufacturer?.name ??
      device.device_type.manufacturer?.display ??
      "Não informado",
    primaryIp4: device.primary_ip4?.address ?? null,
    primaryIp6: device.primary_ip6?.address ?? null,
    customFields: device.custom_fields,
  };
}

/** Cria os resumos de fabricantes exibidos nas listas da aplicação. */
export function mapManufacturers(
  items: NetBoxManufacturer[],
): OrganizationSummary[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || "Sem descrição",
    detail: `${item.device_type_count ?? 0} tipo(s) de equipamento`,
  }));
}

/**
 * Cria os resumos de funções de dispositivo e mantém os metadados usados pela
 * UI para diferenciar funções permitidas em máquinas virtuais.
 */
export function mapDeviceRoles(
  items: NetBoxDeviceRole[],
): OrganizationSummary[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name ?? item.display,
    description: item.description || "Sem descrição",
    detail: `Função da VM: ${item.vm_role ? "Sim" : "Não"}`,
    vmRole: item.vm_role,
    color: item.color,
  }));
}
