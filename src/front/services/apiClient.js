const BASE_URL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

export const apiClient = async (path, { method = "GET", body, auth = false } = {}) => {
    const headers = { "Content-Type": "application/json" };

    if (auth) {
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) return Promise.reject(response);
    return response.json();
};
