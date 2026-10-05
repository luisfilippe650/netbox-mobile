import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthenticatedUser } from "../services";
import { hasObjectAccess, type AccessAction } from "./access-control";

type AccessContextValue = {
  user: AuthenticatedUser | null;
  isUnrestricted: boolean;
  setSessionAccess: (user: AuthenticatedUser, unrestricted: boolean) => void;
  clearSessionAccess: () => void;
  can: (objectType: string, action: AccessAction) => boolean;
};

const AccessContext = createContext<AccessContextValue | null>(null);

export function AccessProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [unrestricted, setUnrestricted] = useState(false);
  const setSessionAccess = useCallback(
    (nextUser: AuthenticatedUser, nextUnrestricted: boolean) => {
      setUser(nextUser);
      setUnrestricted(nextUnrestricted);
    },
    [],
  );
  const clearSessionAccess = useCallback(() => {
    setUser(null);
    setUnrestricted(false);
  }, []);

  const value = useMemo<AccessContextValue>(
    () => ({
      user,
      isUnrestricted: unrestricted,
      setSessionAccess,
      clearSessionAccess,
      can: (objectType, action) =>
        hasObjectAccess(user, unrestricted, objectType, action),
    }),
    [clearSessionAccess, setSessionAccess, unrestricted, user],
  );

  return (
    <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
  );
}

// O hook fica junto ao Provider para manter uma única API pública do contexto.
// oxlint-disable-next-line react/only-export-components
export function useAccess() {
  const context = useContext(AccessContext);
  if (!context)
    throw new Error("useAccess deve ser usado dentro de AccessProvider.");
  return context;
}
