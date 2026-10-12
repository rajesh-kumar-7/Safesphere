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



function MapSearchController({ target }) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo(target, 15, { duration: 1.5 });
    }
  }, [target, map]);

  return null;
}
export default function App() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
const [searchTarget, setSearchTarget] = useState(null);
const [searchError, setSearchError] = useState("");
const [searching, setSearching] = useState(false);
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

async function handleSearch(event) {
  event.preventDefault();

  const query = searchQuery.trim();

  if (!query) {
    setSearchError("Please enter an area or city.");
    return;
  }

  setSearching(true);
  setSearchError("");

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Location search is temporarily unavailable.");
    }

    const results = await response.json();

    if (results.length === 0) {
      setSearchError("Location not found. Try another search.");
      return;
    }

    setSearchTarget([
      Number(results[0].lat),
      Number(results[0].lon),
    ]);
  } catch (error) {
    setSearchError(
      error.message || "Could not search for this location."
    );
  } finally {
    setSearching(false);
  }
}
function goToMyLocation() {
  if (!userLocation) {
    setSearchError(
      "Your location is not available. Please allow location permission."
    );
    return;
  }

  setSearchError("");
  setSearchTarget([...userLocation]);
}
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
          
<form
  onSubmit={handleSearch}
  style={{
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
  }}
>
  <input
    type="text"
    value={searchQuery}
    onChange={(event) => setSearchQuery(event.target.value)}
    placeholder="Search area, city or landmark..."
    aria-label="Search for a location"
    style={{
      flex: 1,
      minWidth: 0,
      padding: "12px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
    }}
  />

  <button
    type="submit"
    disabled={searching}
    style={{
      padding: "12px 18px",
      border: "none",
      borderRadius: "8px",
      background: "#2563eb",
      color: "white",
      cursor: "pointer",
    }}
  >
    {searching ? "Searching..." : "Search"}
  </button>
  <button
  type="button"
  onClick={goToMyLocation}
  style={{
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#16a34a",
    color: "white",
    cursor: "pointer",
    whiteSpace: "nowrap",
  }}
>
  📍 My Location
</button>
</form>

{searchError && (
  <p role="alert" style={{ color: "#dc2626" }}>
    {searchError}
  </p>
)}

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
              <MapSearchController target={searchTarget} />
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
