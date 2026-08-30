import { createContext, useContext, useEffect, useState } from "react";
import authApi from "../api/authApi";
import technicianApi from "../api/technicianApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { userId, name, email, role, technicianId? }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on startup.
  useEffect(() => {
    const savedToken = localStorage.getItem("keystone_token");
    const savedUser = localStorage.getItem("keystone_user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("keystone_token");
        localStorage.removeItem("keystone_user");
      }
    }
    setLoading(false);
  }, []);

  const persist = (nextToken, nextUser) => {
    localStorage.setItem("keystone_token", nextToken);
    localStorage.setItem("keystone_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const buildUserFromResponse = (data) => ({
    userId: data.userId ?? data.id ?? null,
    name: data.fullName ?? data.name ?? data.username ?? "",
    email: data.email ?? "",
    role: (data.role || "").toUpperCase(),
  });

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const data = res.data || {};
    const nextToken = data.token ?? data.accessToken ?? data.jwt;
    let nextUser = buildUserFromResponse(data);

    // Technicians need their technician-profile id to use most of their
    // own endpoints (assigned work, timers, availability).
    if (nextUser.role === "TECHNICIAN" && nextUser.userId) {
      try {
        localStorage.setItem("keystone_token", nextToken); // so the lookup call is authenticated
        const techRes = await technicianApi.getByUser(nextUser.userId);
        nextUser.technicianId = techRes.data?.id ?? techRes.data?.technicianId ?? null;
      } catch {
        nextUser.technicianId = null;
      }
    }

    persist(nextToken, nextUser);
    return nextUser;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("keystone_token");
    localStorage.removeItem("keystone_user");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    role: user?.role ?? null,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
