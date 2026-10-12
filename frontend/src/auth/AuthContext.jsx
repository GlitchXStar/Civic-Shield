import { createContext, useContext, useMemo, useState } from "react";

export const ROLES = {
  CITIZEN: "citizen",
  POLICE: "police",
  ADMIN: "admin",
};

export const ROLE_LABELS = {
  [ROLES.CITIZEN]: "Citizen",
  [ROLES.POLICE]: "Police",
  [ROLES.ADMIN]: "Admin / SHO",
};

export const ROLE_HOME = {
  [ROLES.CITIZEN]: "/citizen/dashboard",
  [ROLES.POLICE]: "/police/dashboard",
  [ROLES.ADMIN]: "/admin/dashboard",
};

const STORAGE_KEY = "crimeconnect-session";

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.role && ROLE_HOME[session.role] ? session : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const login = (role, profile = {}) => {
    const next = {
      role,
      name: profile.name || ROLE_LABELS[role],
      email: profile.email || "",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    return next;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  const value = useMemo(() => ({
    session,
    role: session?.role || null,
    isAuthenticated: Boolean(session),
    login,
    logout,
    can: (allowedRoles) => Boolean(session?.role && allowedRoles.includes(session.role)),
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
