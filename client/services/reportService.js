
const API_URL = "http://localhost:5000/api/reports";

export async function fetchReports() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Could not load reports");
  }

  return response.json();
}

