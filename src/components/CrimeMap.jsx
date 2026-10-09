import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultCenter = [19.076, 72.8777]; // Mumbai; replace with API/user location in production.

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickPicker({ onPick }) {
  useMapEvents({
    click(event) {
      onPick?.([event.latlng.lat, event.latlng.lng]);
    },
  });
  return null;
}

export default function CrimeMap({ selectable = false, value, onChange, markers = [], height = 360 }) {
  const [selected, setSelected] = useState(value || null);
  const center = value || markers[0]?.position || defaultCenter;

  useEffect(() => {
    setSelected(value || null);
  }, [value]);

  const allMarkers = useMemo(() => markers.filter((item) => Array.isArray(item.position)), [markers]);

  const pick = (position) => {
    setSelected(position);
    onChange?.(position);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <MapContainer center={center} zoom={11} scrollWheelZoom={false} style={{ height, width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {selectable && <ClickPicker onPick={pick} />}
        {allMarkers.map((item) => (
          <Marker key={item.id || `${item.position[0]}-${item.position[1]}`} position={item.position} icon={markerIcon}>
            <Popup><strong>{item.title || "Incident"}</strong>{item.description && <div className="mt-1 text-xs">{item.description}</div>}</Popup>
          </Marker>
        ))}
        {selected && (
          <Marker position={selected} icon={markerIcon}>
            <Popup>Selected incident location<br /><span className="text-xs">{selected[0].toFixed(5)}, {selected[1].toFixed(5)}</span></Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
