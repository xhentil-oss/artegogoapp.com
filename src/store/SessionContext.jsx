import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Sesioni i përdoruesit: identiteti, abonimi, të drejtat.
 *
 * Kur vjen backend-i, `login`/`logout`/`subscribe` bëhen thirrje HTTP dhe
 * `user` mbushet nga `/me` — konsumatorët nuk ndryshojnë.
 */
const SessionContext = createContext(null);

const GUEST = { name: "Artemisa" };

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = useCallback(() => setUser(GUEST), []);
  const logout = useCallback(() => {
    setUser(null);
    setIsPremium(false);
    setIsAdmin(false);
  }, []);
  const subscribe = useCallback(() => setIsPremium(true), []);

  const value = useMemo(
    () => ({
      user,
      name: user?.name ?? "",
      isAuthenticated: user !== null,
      isPremium,
      isAdmin,
      login,
      logout,
      subscribe,
      setIsAdmin,
    }),
    [user, isPremium, isAdmin, login, logout, subscribe]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession duhet të përdoret brenda <SessionProvider>");
  return ctx;
}
