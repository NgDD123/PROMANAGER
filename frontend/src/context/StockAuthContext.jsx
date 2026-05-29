import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import {authService} from "../services/authService";
import axios from "axios";
import {
  setServiceAuth,
  clearServiceAuth,
  getServiceToken,
  getServiceUser,
} from "../utils/authCookies.js";
import { resolveUserRoleName } from "../config/loginRedirect.js";

const StockAuthContext = createContext();

function normalizeStockSessionUser(user) {
  if (!user) return null;
  const roleName = resolveUserRoleName(user);
  if (roleName === "SUPER_ADMIN" || user.legacyRole === "super_admin") {
    return { ...user, role: "SUPER_ADMIN" };
  }
  return roleName ? { ...user, role: roleName } : user;
}

export function useStockAuth() {
  return useContext(StockAuthContext);
}

export function StockAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    () => getServiceToken("stock") || localStorage.getItem("token") || null
  );
  const [loading, setLoading] = useState(true);
  const isRefreshingRef = useRef(false);

  // Setup Axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const isRefreshRequest = originalRequest.url?.includes('/refresh');
        
        // Don't retry refresh requests or if already refreshing
        if (isRefreshRequest || isRefreshingRef.current) {
          if (isRefreshRequest) {
            // Refresh failed, logout immediately
            isRefreshingRef.current = false;
            setUser(null);
            setAccessToken(null);
            clearServiceAuth("stock");
          }
          return Promise.reject(error);
        }

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          accessToken &&
          !isRefreshingRef.current
        ) {
          originalRequest._retry = true;
          isRefreshingRef.current = true;
          try {
            const data = await authService.refresh();
            if (data && data.token) {
              setAccessToken(data.token);
              if (data.user) setUser(data.user);
              setServiceAuth("stock", { token: data.token, user: data.user });
              originalRequest.headers["Authorization"] = `Bearer ${data.token}`;
              isRefreshingRef.current = false;
              return axios(originalRequest);
            } else {
              throw new Error("Invalid refresh response");
            }
          } catch (err) {
            isRefreshingRef.current = false;
            setUser(null);
            setAccessToken(null);
            clearServiceAuth("stock");
            return Promise.reject(err);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [accessToken]);

  // Hydrate session from cookies (e.g. after central /login) or stock /me
  useEffect(() => {
    const loadUser = async () => {
      const token = getServiceToken("stock") || localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      setAccessToken(token);

      const cookieUser = getServiceUser("stock");
      if (cookieUser) {
        setUser(normalizeStockSessionUser(cookieUser));
        setLoading(false);
        return;
      }

      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.role === "super_admin" || parsedUser.legacyRole === "super_admin") {
            setUser({ ...parsedUser, role: "SUPER_ADMIN" });
            setLoading(false);
            return;
          }
        }

        const data = await authService.me();
        setUser(normalizeStockSessionUser(data));
      } catch {
        setUser(null);
        setAccessToken(null);
        clearServiceAuth("stock");
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const register = async (formData) => {
    const data = await authService.register(formData);
    setAccessToken(data.token);
    setUser(data.user);
    setServiceAuth("stock", { token: data.token, user: data.user });
    return data.user;
  };

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    setAccessToken(data.token);
    setUser(data.user);
    setServiceAuth("stock", { token: data.token, user: data.user });
    return data.user;
  };

  const logout = async () => {
    try {
      const token = getServiceToken("stock");
      if (token && user?.role !== 'SUPER_ADMIN') {
        await authService.logout();
      }
    } catch {}
    isRefreshingRef.current = false;
    setUser(null);
    setAccessToken(null);
    clearServiceAuth("stock");
  };

  const hasRole = (roles) => {
    if (!user) return false;
    const userRole = (resolveUserRoleName(user) || "").toUpperCase();
    
    // Service / org admins and directors have full stock access
    if (
      userRole === "ADMIN" ||
      userRole === "SUPER_ADMIN" ||
      userRole === "STOCK_ADMIN" ||
      userRole === "DIRECTOR_MANAGER"
    ) {
      return true;
    }
    
    if (Array.isArray(roles)) {
      const normalizedRoles = roles.map(r => (r || "").toUpperCase());
      return normalizedRoles.includes(userRole);
    }
    return userRole === (roles || "").toUpperCase();
  };

  const inDepartment = (departments) => {
    if (!user) return false;
    const userRole = (resolveUserRoleName(user) || "").toUpperCase();
    
    if (
      userRole === "ADMIN" ||
      userRole === "SUPER_ADMIN" ||
      userRole === "STOCK_ADMIN" ||
      userRole === "DIRECTOR_MANAGER"
    ) {
      return true;
    }
    
    if (!departments) return true;
    if (Array.isArray(departments)) return departments.includes(user.department);
    return user.department === departments;
  };

  const value = {
    user,
    loading,
    accessToken,
    setAccessToken,
    setUser,
    register,
    login,
    logout,
    hasRole,
    inDepartment,
  };

  return (
    <StockAuthContext.Provider value={value}>
      {!loading && children}
    </StockAuthContext.Provider>
  );
}
