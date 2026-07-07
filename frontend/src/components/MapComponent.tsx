"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import type { PGListing } from "@/types";

type MapListing = PGListing & { lat?: number; lng?: number };

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

interface MapComponentProps {
  listings: (PGListing | MapListing)[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMarkerClick?: (listing: PGListing) => void;
  selectedId?: string;
}

/** Watches center/zoom changes and moves the map view — must be child of MapContainer. */
function MapCenterUpdater({ center, zoom }: { center?: [number, number]; zoom?: number }) {
  const { useMap } = require("react-leaflet");
  const map = useMap();
  const prev = useRef(center);

  useEffect(() => {
    if (!center) return;
    const [lat, lng] = center;
    const [prevLat, prevLng] = prev.current || [0, 0];
    if (lat !== prevLat || lng !== prevLng) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
      prev.current = center;
    }
  }, [center, zoom, map]);

  return null;
}

function MapContent({ listings, center, zoom, onMarkerClick, selectedId }: MapComponentProps) {
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

  const defaultIcon = useMemo(() => {
    if (!L) return null;
    return new L.Icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }, [L]);

  const selectedIcon = useMemo(() => {
    if (!L) return null;
    return new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }, [L]);

  if (!L) return null;

  return (
    <MapContainer
      center={center || [17.440, 78.345]}
      zoom={zoom || 14}
      className="w-full h-full z-0"
      scrollWheelZoom={true}
    >
      <MapCenterUpdater center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {listings.map((listing) => {
        const lat = (listing as any).lat ?? listing.latitude;
        const lng = (listing as any).lng ?? listing.longitude;
        const area = (listing as any).area ?? (listing as any).area;
        return (
          <Marker
            key={listing.id}
            position={[lat, lng]}
            icon={selectedId === listing.id ? selectedIcon : defaultIcon}
            eventHandlers={{
              click: () => onMarkerClick?.(listing),
            }}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                <p className="font-semibold mb-1">{listing.name}</p>
                <p className="text-xs text-gray-500 mb-1">
                  {area && `${area}, `}{listing.city}
                </p>
                <p className="font-bold text-orange-500">
                  ₹{listing.rentMin.toLocaleString()}
                  {listing.rentMax && ` - ₹${listing.rentMax.toLocaleString()}`}
                </p>
                <a
                  href={`/pg/${listing.slug}`}
                  className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline"
                >
                  View Details →
                </a>
              </div>
            </Popup>
          </Marker>
        );}
      )}
    </MapContainer>
  );
}

export function MapComponent(props: MapComponentProps) {
  return <MapContent {...props} />;
}
