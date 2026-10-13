const API_URL = import.meta.env.VITE_API_URL;

export async function fetchReports() {
  const response = await fetch(`${API_URL}/api/reports`);

  if (!response.ok) {
    throw new Error("Could not load reports");
  }

  return response.json();
}