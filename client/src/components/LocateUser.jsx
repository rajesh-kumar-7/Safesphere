
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function LocateUser({ onLocationFound }) {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } =
          position.coords;

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

