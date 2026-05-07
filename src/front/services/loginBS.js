export const loginUser = async (user) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/login`, {
        method: "POST",
        body: JSON.stringify(user),
        headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const getProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });
    if (!response.ok) return null;
    return await response.json();
};

export const forgotPassword = async (email) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const resetPassword = async (token, password) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};