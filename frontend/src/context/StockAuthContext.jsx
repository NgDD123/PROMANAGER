import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import {authService} from "../services/authService";
import axios from "axios";

const StockAuthContext = createContext();

export function useStockAuth() {
  return useContext(StockAuthContext);
}

export function StockAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("token") || null);
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
            localStorage.removeItem("token");
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
              localStorage.setItem("token", data.token);
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
            localStorage.removeItem("token");
            return Promise.reject(err);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [accessToken]);

  // Load user from backend if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (accessToken) {
        try {
          const data = await authService.me();
          setUser(data);
        } catch {
          setUser(null);
          setAccessToken(null);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const register = async (formData) => {
    const data = await authService.register(formData);
    setAccessToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    return data.user;
  };

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    setAccessToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    return data.user;
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) await authService.logout();
    } catch {}
    isRefreshingRef.current = false;
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("token");
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return user.role === roles;
  };

  const inDepartment = (departments) => {
    if (!user) return false;
    if (["ADMIN", "MANAGER"].includes(user.role)) return true;
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
