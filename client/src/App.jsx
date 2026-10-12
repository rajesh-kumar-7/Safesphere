



import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

const colors = {
  high: "#ef4444",
  medium: "#eab308",
  low: "#22c55e",
};


export default function App() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/reports")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load reports");
        }
        return response.json();
      })
      .then((data) => setReports(data))
      .catch(() => setError("Could not connect to the backend."));
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>SafeSphere</h1>
          <p>Community-powered safety intelligence</p>
        </div>
        <span className="status">● Connected API</span>
      </header>

      <main className="dashboard">
        <section className="map-section">
          <h2>Safety Map</h2>
          <p className="subtitle">
            Explore community-reported safety concerns.
          </p>

          {error && <p>{error}</p>}

          <div className="map">
            <MapContainer
              center={[29.6857, 76.9905]}
              zoom={14}
              scrollWheelZoom
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {reports.map((report) => (
                <CircleMarker
                  key={report.id}
                  center={[report.latitude, report.longitude]}
                  radius={13}
                  pathOptions={{
                    color: colors[report.severity] || colors.medium,
                    fillColor: colors[report.severity] || colors.medium,
                    fillOpacity: 0.65,
                  }}
                >
                  <Popup>
                    {report.category} — {report.severity} reported risk
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <div className="legend">
            <span>🔴 High</span>
            <span>🟡 Moderate</span>
            <span>🟢 Low</span>
          </div>
        </section>

        <aside className="sidebar">
          <h2>Safety Overview</h2>

          <div className="stat">
            <span>Total reports</span>
            <strong>{reports.length}</strong>
          </div>

          <div className="stat">
            <span>High-risk reports</span>
            <strong className="red">
              {reports.filter((r) => r.severity === "high").length}
            </strong>
          </div>

          <p className="note">
            Report data is for demonstration. Reported risk does not confirm
            that a location is dangerous.
          </p>
        </aside>
      </main>
    </div>
  );
}