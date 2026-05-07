const backend_url = import.meta.env.VITE_BACKEND_URL;

export const getFolders = async () => {
  const response = await fetch(`${backend_url}/api/folders/`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  if (!response.ok) return false;
  return await response.json();
};

export const createFolder = async (title) => {
  const response = await fetch(`${backend_url}/api/folders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ title })
  });
  if (!response.ok) return false;
  return await response.json();
};

export const updateFolder = async (id, title) => {
  const response = await fetch(`${backend_url}/api/folders/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ title })
  });
  if (!response.ok) return false;
  return await response.json();
};

export const deleteFolder = async (id) => {
  const response = await fetch(`${backend_url}/api/folders/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  if (!response.ok) return false;
  return await response.json();
};