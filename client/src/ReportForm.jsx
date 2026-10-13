
import { useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function ReportForm({ onReportCreated, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [photo, setPhoto] = useState("");
  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState("Suspicious activity");
  const [customCategory, setCustomCategory] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setMessage("");
    } catch {
      setMessage("Camera access failed. Allow camera permission and try again.");
    }
  }

  function capturePhoto() {
    const video = videoRef.current;

    if (!video || !video.videoWidth) {
      setMessage("Wait for the camera to start.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0);

    setPhoto(canvas.toDataURL("image/jpeg", 0.8));

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    video.srcObject = null;
  }

  function getLocation() {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by this browser.");
      return;
    }

    setMessage("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setMessage("Location captured.");
      },
      () => setMessage("Location unavailable. Allow location permission and retry."),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

 
async function submitReport(event) {
  event.preventDefault();
  const finalCategory =
  category === "Other" ? customCategory.trim() : category;

if (!finalCategory) {
  setMessage("Please enter your incident category.");
  return;
}

  if (!photo || !location) {
    setMessage("Capture a photo and get your location first.");
    return;
  }

  setLoading(true);
  setMessage("Uploading photo...");

  try {
    // Upload photo to Cloudinary
    const uploadResponse = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo }),
    });

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(uploadData.message || "Photo upload failed.");
    }

    // Save report with the image URL
    const response = await fetch(`${API_URL}/api/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category:finalCategory,
        severity,
        description,
        latitude: location.latitude,
        longitude: location.longitude,
        imageUrl: uploadData.imageUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Report submission failed.");
    }

    setMessage("Report and photo saved successfully!");
    setPhoto("");
    setLocation(null);
    setDescription("");
    onReportCreated?.();
  } catch (error) {
    setMessage(error.message || "Could not connect to the backend.");
  } finally {
    setLoading(false);
  }
}

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  return (
    <form className="report-form" onSubmit={submitReport}>
      <div className="report-form-header">
        <h2>Report a Concern</h2>
        <button type="button" onClick={onClose}>Close</button>
      </div>

<label>Incident category</label>

<select
  value={category}
  onChange={(e) => {
    setCategory(e.target.value);
    if (e.target.value !== "Other") {
      setCustomCategory("");
    }
  }}
>
  <option value="Suspicious activity">Suspicious activity</option>
  <option value="Theft or robbery">Theft or robbery</option>
  <option value="Vandalism">Vandalism or property damage</option>
  <option value="Harassment">Harassment or threatening behavior</option>
  <option value="Violence">Violence or physical assault</option>
  <option value="Suspicious object">Abandoned or suspicious object</option>
  <option value="Road hazard">Road hazard or accident</option>
  <option value="Broken streetlight">Broken streetlight</option>
  <option value="Fire or smoke">Fire or smoke</option>
  <option value="Public safety concern">Public safety concern</option>
  <option value="Other">Other</option>
</select>

{category === "Other" && (
  <input
    type="text"
    value={customCategory}
    onChange={(e) => setCustomCategory(e.target.value)}
    placeholder="Enter your incident category"
    maxLength={100}
    required
  />
)}


      <label>Reported severity</label>
      <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
        <option value="low">Low</option>
        <option value="medium">Moderate</option>
        <option value="high">High</option>
      </select>

      <label>Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={500}
        placeholder="Describe the concern (avoid personal information)"
      />

      <div className="camera-box">
        <video ref={videoRef} autoPlay playsInline muted />

        {photo && (
          <img src={photo} alt="Captured report" />
        )}
      </div>

      <div className="report-actions">
        <button type="button" onClick={startCamera}>
          Open Camera
        </button>

        <button type="button" onClick={capturePhoto}>
          Capture Photo
        </button>

        <button type="button" onClick={() => {
          stopCamera();
          setPhoto("");
        }}>
          Retake
        </button>
      </div>

      <button type="button" onClick={getLocation}>
        {location ? "Location Captured ✓" : "Get My GPS Location"}
      </button>

      {location && (
        <p>
          Coordinates: {location.latitude.toFixed(5)},{" "}
          {location.longitude.toFixed(5)}
        </p>
      )}

      {message && <p role="status">{message}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  );
}