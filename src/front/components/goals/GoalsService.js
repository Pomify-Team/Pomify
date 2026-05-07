const backend_url = import.meta.env.VITE_BACKEND_URL; // ej: http://localhost:3001


export const getGoals = async () => {
  const response = await fetch(`${backend_url}/api/goals/`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  if (!response.ok) return false;
  return await response.json();
};


export const getGoal = async (goalId) => {
  const response = await fetch(`${backend_url}/api/goals/${goalId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  if (!response.ok) return false;
  return await response.json();
};


export const createGoal = async (title, content = "") => {
  const response = await fetch(`${backend_url}/api/goals/`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ title, content })
  });
  if (!response.ok) return false;
  return await response.json();
};


export const updateGoal = async (goalId, updatedData) => {
  const response = await fetch(`${backend_url}/api/goals/${goalId}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(updatedData)
  });
  if (!response.ok) return false;
  return await response.json();
};


export const deleteGoal = async (goalId) => {
  const response = await fetch(`${backend_url}/api/goals/${goalId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  if (!response.ok) return false;
  return await response.json();
};