import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AuthenticatedUser, NetBoxObjectPermission } from "../services";

export type AccessAction = "view" | "add" | "change" | "delete";

type AccessContextValue = {
  user: AuthenticatedUser | null;
  isUnrestricted: boolean;
  setSessionAccess: (user: AuthenticatedUser, unrestricted: boolean) => void;
  clearSessionAccess: () => void;
  can: (objectType: string, action: AccessAction) => boolean;
};

const AccessContext = createContext<AccessContextValue | null>(null);

function includesGrant(permission: NetBoxObjectPermission, objectType: string, action: AccessAction) {
  return permission.enabled && permission.object_types.includes(objectType) && permission.actions.includes(action);
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [unrestricted, setUnrestricted] = useState(false);
  const permissions = useMemo(() => user
    ? [...user.permissions, ...user.groups.flatMap((group) => group.permissions)]
    : [], [user]);

  const value = useMemo<AccessContextValue>(() => ({
    user,
    isUnrestricted: unrestricted,
    setSessionAccess: (nextUser, nextUnrestricted) => {
      setUser(nextUser);
      setUnrestricted(nextUnrestricted);
    },
    clearSessionAccess: () => {
      setUser(null);
      setUnrestricted(false);
    },
    can: (objectType, action) => unrestricted || permissions.some((permission) => includesGrant(permission, objectType, action)),
  }), [permissions, unrestricted, user]);

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  const context = useContext(AccessContext);
  if (!context) throw new Error("useAccess deve ser usado dentro de AccessProvider.");
  return context;
}
