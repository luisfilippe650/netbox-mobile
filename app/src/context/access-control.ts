import type {
  AuthenticatedUser,
  NetBoxObjectPermission,
} from "../services";

export type AccessAction = "view" | "add" | "change" | "delete";

function includesGrant(
  permission: NetBoxObjectPermission,
  objectType: string,
  action: AccessAction,
) {
  return (
    permission.enabled &&
    permission.object_types.includes(objectType) &&
    permission.actions.includes(action)
  );
}

/**
 * Avalia as permissões diretas e herdadas sem depender do ciclo de renderização
 * do React. A mesma regra é usada pela interface e pelo carregamento da API.
 */
export function hasObjectAccess(
  user: AuthenticatedUser | null,
  unrestricted: boolean,
  objectType: string,
  action: AccessAction,
) {
  if (unrestricted) return true;
  if (!user) return false;

  const permissions = [
    ...user.permissions,
    ...user.groups.flatMap((group) => group.permissions),
  ];
  return permissions.some((permission) =>
    includesGrant(permission, objectType, action),
  );
}
