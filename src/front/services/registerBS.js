import { apiClient } from "./apiClient";

export const registerUser = async (user) => {
    return apiClient("/api/user/register", { method: "POST", body: user });
};
