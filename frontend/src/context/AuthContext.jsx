import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

// Store tokens per tab
const tabTokens = {};

export function AuthProvider({ children, tabId = "default" }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(tabTokens[tabId]?.token || null);
  const [refreshToken, setRefreshToken] = useState(tabTokens[tabId]?.refreshToken || null);
  const [loading, setLoading] = useState(true);

  // ---- Set Token Helper ----
  const setToken = (t, r = null) => {
    tabTokens[tabId] = { token: t, refreshToken: r };
    setTokenState(t);
    setRefreshToken(r);
  };

  // ---- LOGIN ----
  const login = async (email, password) => {
    const resp = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!resp.ok) throw new Error("Login failed");

    const { token: t, refreshToken: r, user: u } = await resp.json();
    const normalizedUser = { ...u, role: (u.role || "PATIENT").toUpperCase() };

    setToken(t, r);
    setUser(normalizedUser);

    // Set provider online
    if (["DOCTOR", "PHARMACY", "CALLCENTER"].includes(normalizedUser.role)) {
      try {
        await fetchWithAuth("http://localhost:5000/api/v1/status/online", { method: "POST" });
      } catch (err) {
        console.error("Failed to set user online:", err);
      }
    }

    return normalizedUser;
  };

  // ---- REGISTER ----
  const register = async (data) => {
    const resp = await fetch("http://localhost:5000/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!resp.ok) {
      const errorData = await resp.json();
      throw new Error(errorData.message || "Registration failed");
    }

    const { token: t, refreshToken: r, user: u } = await resp.json();
    const normalizedUser = { ...u, role: (u.role || "PATIENT").toUpperCase() };

    setToken(t, r);
    setUser(normalizedUser);

    // Set provider online if applicable
    if (["DOCTOR", "PHARMACY", "CALLCENTER"].includes(normalizedUser.role)) {
      try {
        await fetchWithAuth("http://localhost:5000/api/v1/status/online", { method: "POST" });
      } catch (err) {
        console.error("Failed to set user online:", err);
      }
    }

    return normalizedUser;
  };

  // ---- LOGOUT ----
  const logout = async () => {
    if (user && ["DOCTOR", "PHARMACY", "CALLCENTER"].includes(user.role)) {
      try {
        await fetchWithAuth("http://localhost:5000/api/v1/status/offline", { method: "POST" });
      } catch (err) {
        console.error("Failed to set user offline:", err);
      }
    }

    setToken(null);
    setUser(null);
  };

  // ---- REFRESH ACCESS TOKEN ----
  const refreshAccessToken = async () => {
    if (!refreshToken) {
      await logout();
      return null;
    }

    try {
      const resp = await fetch("http://localhost:5000/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!resp.ok) throw new Error("Refresh failed");

      const { token: newToken, refreshToken: newRefresh, user: u } = await resp.json();
      setToken(newToken, newRefresh);
      setUser({ ...u, role: (u.role || "PATIENT").toUpperCase() });
      return newToken;
    } catch (err) {
      console.error("Refresh error:", err);
      await logout();
      return null;
    }
  };

  // ---- FETCH WITH AUTH (auto refresh) ----
  const fetchWithAuth = async (url, options = {}) => {
    if (!token) throw new Error("No access token");

    let resp = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    if (resp.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) throw new Error("Unauthorized");

      resp = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${newToken}`,
        },
      });
    }

    return resp;
  };

  // ---- RESTORE SESSION (/me) ----
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const restoreSession = async () => {
      try {
        const resp = await fetchWithAuth("http://localhost:5000/api/v1/auth/me");
        if (!resp.ok) throw new Error("Session restore failed");

        const userData = await resp.json();
        const normalizedUser = { ...userData, role: (userData.role || "PATIENT").toUpperCase() };
        setUser(normalizedUser);

        if (["DOCTOR", "PHARMACY", "CALLCENTER"].includes(normalizedUser.role)) {
          try {
            await fetchWithAuth("http://localhost:5000/api/v1/status/online", { method: "POST" });
          } catch (err) {
            console.error("Failed to set user online:", err);
          }
        }
      } catch (err) {
        console.error("Auth restore failed:", err);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [token]);

  // ---- Auto offline on tab close ----
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (user && ["DOCTOR", "PHARMACY", "CALLCENTER"].includes(user.role)) {
        try {
          await fetchWithAuth("http://localhost:5000/api/v1/status/offline", { method: "POST" });
        } catch (err) {
          console.error("Failed to set user offline on tab close:", err);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user, token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
