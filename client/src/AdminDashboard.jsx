
import { useEffect, useState } from "react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  async function loadReports() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/reports`);

      if (!response.ok) {
        throw new Error("Could not load reports");
      }

      setReports(await response.json());
    } catch {
      setError("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
   
  }, []);

  async function verifyReport(id) {
    if (!password.trim()) {
      setError("Enter the admin password first.");
      return;
    }

    setBusyId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/reports/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ status: "verified" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not verify report");
      }

      setMessage("Report verified successfully.");
      await loadReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  async function deleteReport(id) {
    if (!password.trim()) {
      setError("Enter the admin password first.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    setBusyId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/reports/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": password,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete report");
      }

      setMessage("Report deleted successfully.");
      await loadReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <main style={{ maxWidth: "1000px", margin: "30px auto", padding: "20px" }}>
      <h1>SafeSphere Admin Dashboard</h1>
      <p>Review and manage community safety reports.</p>

      <label htmlFor="admin-password">Admin password</label>

      <div style={{ display: "flex", gap: "10px", margin: "12px 0 24px" }}>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          style={{ flex: 1, padding: "10px" }}
        />
          <button onClick={loadReports}>Login / Load Reports</button>

        <button onClick={loadReports}>Refresh</button>
      </div>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>All Reports ({reports.length})</h2>

      {loading ? (
        <p>Loading reports...</p>
      ) : reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        reports.map((report) => (
          <article
            key={report.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <h3>{report.category}</h3>

            <p><strong>Severity:</strong> {report.severity}</p>
            <p><strong>Description:</strong> {report.description || "None"}</p>
            <p><strong>Status:</strong> {report.verificationStatus || "pending"}</p>
            <p><strong>Location:</strong> {report.latitude}, {report.longitude}</p>

            {report.imageUrl && (
              <img
                src={report.imageUrl}
                alt="Reported incident"
                style={{ width: "100%", maxWidth: "300px" }}
              />
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button
                disabled={
                  busyId === report.id ||
                  report.verificationStatus === "verified"
                }
                onClick={() => verifyReport(report.id)}
              >
                {report.verificationStatus === "verified"
                  ? "Verified"
                  : busyId === report.id
                  ? "Please wait..."
                  : "Verify Report"}
              </button>

              <button
                disabled={busyId === report.id}
                onClick={() => deleteReport(report.id)}
                style={{ background: "#dc2626", color: "white", padding: "8px" }}
              >
                Delete Report
              </button>
            </div>
          </article>
        ))
      )}
    </main>
  );
}

