const backend_url = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

export const getShortcuts = async () => {
  const res = await fetch(`${backend_url}/api/user/shortcuts`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  if (!res.ok) return [];
  return await res.json();
};

export const createShortcut = async (name, url, service) => {
  const res = await fetch(`${backend_url}/api/user/shortcuts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ name, url, service })
  });
  if (!res.ok) return null;
  return await res.json();
};

export const updateShortcut = async (id, name, url, service) => {
  const res = await fetch(`${backend_url}/api/user/shortcuts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ name, url, service })
  });
  if (!res.ok) return null;
  return await res.json();
};

export const deleteShortcut = async (id) => {
  const res = await fetch(`${backend_url}/api/user/shortcuts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  return res.ok;
};
