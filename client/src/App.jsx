
import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

const reports = [
  {
    id: 1,
    position: [29.6857, 76.9905],
    level: "high",
    label: "High reported risk",
  },
  {
    id: 2,
    position: [29.692, 76.982],
    level: "medium",
    label: "Moderate reported risk",
  },
  {
    id: 3,
    position: [29.678, 77.001],
    level: "low",
    label: "Low reported risk",
  },
];

const colors = {
  high: "#ef4444",
  medium: "#eab308",
  low: "#22c55e",
};

export default function App() {
  const [showNotice, setShowNotice] = useState(false);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>SafeSphere</h1>
          <p>Community-powered safety intelligence</p>
        </div>
        <span className="status">● Demo Mode</span>
      </header>

      <main className="dashboard">
        <section className="map-section">
          <h2>Safety Map</h2>
          <p className="subtitle">
            Explore reported safety concerns in your area.
          </p>

          <div className="map">
            <MapContainer
              center={[29.6857, 76.9905]}
              zoom={14}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {reports.map((report) => (
                <CircleMarker
                  key={report.id}
                  center={report.position}
                  radius={13}
                  pathOptions={{
                    color: colors[report.level],
                    fillColor: colors[report.level],
                    fillOpacity: 0.65,
                  }}
                >
                  <Popup>
                    {report.label} (sample data)
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <div className="legend">
            <span>🔴 High reported risk</span>
            <span>🟡 Moderate</span>
            <span>🟢 Low</span>
          </div>
        </section>

        <aside className="sidebar">
          <h2>Safety Overview</h2>

          <div className="stat">
            <span>Total reports</span>
            <strong>3</strong>
          </div>

          <div className="stat">
            <span>High-risk reports</span>
            <strong className="red">1</strong>
          </div>

          <button onClick={() => setShowNotice(true)}>
            + Report a Concern
          </button>

          {showNotice && (
            <p className="notice">
              Camera and location reporting will be added next.
              <button onClick={() => setShowNotice(false)}>
                Close
              </button>
            </p>
          )}

          <p className="note">
            Demo data only. Map colors represent reported concerns,
            not confirmed danger.
          </p>
        </aside>
      </main>
    </div>
  );
}