import ReportForm from "./ReportForm";
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

const colors = {
  high: "#ef4444",
  medium: "#eab308",
  low: "#22c55e",
};

function LocateUser({ onLocationFound }) {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude, accuracy } = position.coords;

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
    console.log("Accuracy in metres:", accuracy);

    const coords = [latitude, longitude];

    onLocationFound(coords);
    map.flyTo(coords, 18);
  },
  (error) => {
    console.error("Location error:", error.message);
  },
  {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 0,
  }
);
  }, [map, onLocationFound]);

  return null;
}
export default function App() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  useEffect(() => {
    fetch("http://localhost:5000/api/reports")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load reports");
        }
        return response.json();
      })
      .then((data) => {
        setReports(data);
        setError("");
      })
      .catch(() => {
        setError("Could not connect to the backend.");
      });
  }, [refreshKey]);

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
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocateUser onLocationFound={setUserLocation} />

              {userLocation && (
                <CircleMarker
                  center={userLocation}
                  radius={8}
                  pathOptions={{
                    color: "#ffffff",
                    fillColor: "#2563eb",
                    fillOpacity: 1,
                    weight: 3,
                  }}
                >
                  <Popup>You are here</Popup>
                </CircleMarker>
              )}

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
                  <Popup minWidth={220} maxWidth={280}>
                    <div className="report-popup">
                      <h3>{report.category}</h3>

                      <p>
                        <strong>Severity:</strong> {report.severity}
                      </p>

                      <p>
                        <strong>Description:</strong>{" "}
                        {report.description?.trim() ||
                          "No description provided."}
                      </p>

                      {report.imageUrl ? (
                        <img
                          src={report.imageUrl}
                          alt="Reported incident"
                          className="report-popup-image"
                        />
                      ) : (
                        <p>No photo uploaded for this report.</p>
                      )}

                      <p>
                        <strong>Status:</strong>{" "}
                        {report.verificationStatus || "pending"}
                      </p>

                      {report.createdAt && (
                        <p>
                          <strong>Reported:</strong>{" "}
                          {new Date(report.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
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

          <button
            className="report-button"
            onClick={() => setShowReportForm(true)}
          >
            + Report a Concern
          </button>

          {showReportForm && (
            <ReportForm
              onReportCreated={() => setRefreshKey((key) => key + 1)}
              onClose={() => setShowReportForm(false)}
            />
          )}

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
