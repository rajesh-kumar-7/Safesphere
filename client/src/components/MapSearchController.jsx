
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function MapSearchController({ target }) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo(target, 15, { duration: 1.5 });
    }
  }, [target, map]);

  return null;
}

