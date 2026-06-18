import { apiClient } from "./apiClient";

export const loginUser = async (user) => {
    return apiClient("/api/user/login", { method: "POST", body: user });
};

export const getProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        return await apiClient("/api/user/profile", { auth: true });
    } catch {
        return null;
    }
};

export const forgotPassword = async (email) => {
    return apiClient("/api/user/forgot-password", {
        method: "POST",
        body: { email: email.toLowerCase() },
    });
};

export const resetPassword = async (token, password) => {
    return apiClient("/api/user/reset-password", {
        method: "POST",
        body: { token, password },
    });
};
