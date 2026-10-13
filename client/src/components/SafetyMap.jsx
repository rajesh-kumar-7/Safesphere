
import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";

import LocateUser from "./LocateUser";
import MapSearchController from "./MapSearchController";

import "leaflet/dist/leaflet.css";

const colors = {
  high: "#ef4444",
  medium: "#eab308",
  low: "#22c55e",
};

export default function SafetyMap({
  reports,
  error,
  userLocation,
  setUserLocation,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTarget, setSearchTarget] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);

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
      const url =
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          "Location search is temporarily unavailable."
        );
      }

      const results = await response.json();

      if (results.length === 0) {
        setSearchError(
          "Location not found. Try another search."
        );
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
          onChange={(event) =>
            setSearchQuery(event.target.value)
          }
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
              center={[
                report.latitude,
                report.longitude,
              ]}
              radius={13}
              pathOptions={{
                color:
                  colors[report.severity] || colors.medium,
                fillColor:
                  colors[report.severity] || colors.medium,
                fillOpacity: 0.65,
              }}
            >
              <Popup minWidth={220} maxWidth={280}>
                <div className="report-popup">
                  <h3>{report.category}</h3>

                  <p>
                    <strong>Severity:</strong>{" "}
                    {report.severity}
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
                      {new Date(
                        report.createdAt
                      ).toLocaleString()}
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
  );
}

