export const registerUser = async (user) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/register`, {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message);
    }
    return data;
};

