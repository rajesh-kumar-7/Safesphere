
import { useEffect, useState } from "react";

import SafetyMap from "./components/SafetyMap";
import SafetyOverview from "./components/SafetyOverview";
import { fetchReports } from "../services/reportService";

import "./App.css";

export default function App() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchReports()
      .then((data) => {
        setReports(data);
        setError("");
      })
      .catch(() => {
        setError("Could not connect to the backend.");
      });
  }, [refreshKey]);

  function handleReportCreated() {
    setRefreshKey((key) => key + 1);
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>SafeSphere</h1>
          <p>Community-powered safety intelligence</p>
        </div>
      </header>

      <main className="dashboard">
        <SafetyMap
          reports={reports}
          error={error}
          userLocation={userLocation}
          setUserLocation={setUserLocation}
        />

        <SafetyOverview
          reports={reports}
          showReportForm={showReportForm}
          setShowReportForm={setShowReportForm}
          onReportCreated={handleReportCreated}
        />
      </main>
    </div>
  );
}

