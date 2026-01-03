// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../../services/stock.service"; 

const AuthContext = createContext(null);
const tabTokens = {};

export function AuthProvider({ children, tabId = "default" }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(tabTokens[tabId]?.token || localStorage.getItem("token") || null);
  const [refreshToken, setRefreshToken] = useState(tabTokens[tabId]?.refreshToken || null);
  const [loading, setLoading] = useState(true);

  const setToken = (t, r = null) => {
    tabTokens[tabId] = { token: t, refreshToken: r };
    setTokenState(t);
    setRefreshToken(r);
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  };

  const normalizeUser = (u) => ({
    ...u,
    role: (u.role || "STAFF").toUpperCase(),
    department: u.department || "General",
  });

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const normalizedUser = normalizeUser(res.user);
    setToken(res.token, res.refreshToken);
    setUser(normalizedUser);
    return normalizedUser;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    const normalizedUser = normalizeUser(res.user);
    setToken(res.token, res.refreshToken);
    setUser(normalizedUser);
    return normalizedUser;
  };

  const logout = async () => {
    try { await authService.logout(); } catch (err) { console.warn(err); }
    setToken(null);
    setUser(null);
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) return logout();
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) throw new Error("Refresh failed");
      const { token: newToken, refreshToken: newRefresh, user: u } = await res.json();
      setToken(newToken, newRefresh);
      setUser(normalizeUser(u));
      return newToken;
    } catch (err) {
      console.error(err);
      await logout();
      return null;
    }
  };

  const fetchWithAuth = async (url, options = {}) => {
    if (!token) throw new Error("No token available");
    let resp = await fetch(url, { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` } });
    if (resp.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) throw new Error("Unauthorized");
      resp = await fetch(url, { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${newToken}` } });
    }
    return resp;
  };

  useEffect(() => {
    const restoreSession = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const profile = await authService.getProfile();
        setUser(normalizeUser(profile));
      } catch (err) {
        console.error(err);
        await logout();
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshAccessToken, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
