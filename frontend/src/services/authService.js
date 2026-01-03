// src/services/authService.js
import axios from "axios";

// Change this to match your backend URL
const API_URL = "http://localhost:5000/api/v1/stock/auth";

const getAuthHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

export const authService = {
    /** REGISTER */
    register: async (data) => {
        const res = await axios.post(`${API_URL}/register`, data);
        if (res.data?.token) {
            localStorage.setItem("token", res.data.token);
        }
        return res.data;
    },

    /** LOGIN */
    login: async (data) => {
        const res = await axios.post(`${API_URL}/login`, data);
        if (res.data?.token) {
            localStorage.setItem("token", res.data.token);
        }
        return res.data;
    },

    /** GET CURRENT USER */
    me: async () => {
        const res = await axios.get(`${API_URL}/me`, getAuthHeader());
        return res.data;
    },

    /** LOGOUT */
    logout: async () => {
        const res = await axios.post(`${API_URL}/logout`, {}, getAuthHeader());
        localStorage.removeItem("token");
        return res.data;
    },

    /** REFRESH TOKEN */
    refresh: async () => {
        const oldToken = localStorage.getItem("token");
        if (!oldToken) return null;

        const res = await axios.post(`${API_URL}/refresh`, { token: oldToken });

        if (res.data?.token) {
            localStorage.setItem("token", res.data.token);
        }

        return res.data;
    },

    /** FORGOT PASSWORD (SEND RESET LINK) */
    forgotPassword: async (data) => {
        const res = await axios.post(`${API_URL}/forgot-password`, data);
        return res.data;
    },

    /** RESET PASSWORD */
    resetPassword: async (data) => {
        const res = await axios.post(`${API_URL}/reset-password`, data);
        return res.data;
    },
};
