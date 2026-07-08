"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

function MapCenterUpdater({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const { useMap } = require("react-leaflet");
  const map = useMap();
  const prev = useRef(center);

  useEffect(() => {
    const [lat, lng] = center;
    const [prevLat, prevLng] = prev.current || [0, 0];
    if (lat !== prevLat || lng !== prevLng) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
      prev.current = center;
    }
  }, [center, zoom, map]);

  return null;
}

function InvalidateOnVisible() {
  const { useMap } = require("react-leaflet");
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

interface PGMapProps {
  latitude: number;
  longitude: number;
  name: string;
  area?: string | null;
  city?: string | null;
}

export function PGMap({ latitude, longitude, name, area, city }: PGMapProps) {
  const L = useMemo(() => (typeof window !== "undefined" ? require("leaflet") : null), []);

  useEffect(() => {
    if (!L) return;
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, [L]);

  if (!L || !latitude || !longitude) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Location not available</p>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-xl overflow-hidden">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        className="w-full h-full z-0"
        scrollWheelZoom={true}
      >
        <MapCenterUpdater center={[latitude, longitude]} zoom={15} />
        <InvalidateOnVisible />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="text-sm min-w-[150px]">
              <p className="font-semibold">{name}</p>
              <p className="text-xs text-gray-500">
                {area && `${area}, `}{city}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
