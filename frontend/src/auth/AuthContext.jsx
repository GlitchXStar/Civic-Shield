import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, clearSession, getStoredUser, getToken, setStoredUser, setToken } from "../services/api";

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

export function normalizeRole(role) {
  const r = String(role || "").toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (r === "police_officer") return ROLES.POLICE;
  if (r === "administrator") return ROLES.ADMIN;
  return r;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const stored = getStoredUser();
    const token = getToken();
    if (stored && token) {
      const role = normalizeRole(stored.role);
      return { ...stored, role };
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync session on mount with backend if token exists
  useEffect(() => {
    async function verifyAuth() {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response?.data?.user) {
          const user = response.data.user;
          const role = normalizeRole(user.role);
          const fullSession = { ...user, role };
          setStoredUser(fullSession);
          setSession(fullSession);
        }
      } catch (err) {
        console.warn("Session verification failed, logging out:", err.message);
        clearSession();
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    }

    verifyAuth();
  }, []);

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    const { token, user } = response.data;
    const role = normalizeRole(user.role);
    const safeSession = { ...user, role };

    setToken(token);
    setStoredUser(safeSession);
    setSession(safeSession);

    return safeSession;
  };

  const register = async (userData) => {
    const response = await authApi.register(userData);
    return response;
  };

  const logout = () => {
    clearSession();
    setSession(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      if (response?.data?.user) {
        const user = response.data.user;
        const role = normalizeRole(user.role);
        const fullSession = { ...user, role };
        setStoredUser(fullSession);
        setSession(fullSession);
        return fullSession;
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
    return null;
  };

  const value = useMemo(() => ({
    session,
    user: session,
    token: getToken(),
    role: session?.role || null,
    isAuthenticated: Boolean(session && getToken()),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    can: (allowedRoles) => {
      const norm = allowedRoles.map(normalizeRole);
      return Boolean(session?.role && norm.includes(session.role));
    },
  }), [session, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
