"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import type { PGListing } from "@/types";

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
  listings: PGListing[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMarkerClick?: (listing: PGListing) => void;
  selectedId?: string;
}

function MapContent({ listings, center, zoom, onMarkerClick, selectedId }: MapComponentProps) {
  const mapRef = useRef<any>(null);
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
      center={center || [20.5937, 78.9629]}
      zoom={zoom || 5}
      className="w-full h-full z-0"
      ref={mapRef}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {listings.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.lat, listing.lng]}
          icon={selectedId === listing.id ? selectedIcon : defaultIcon}
          eventHandlers={{
            click: () => onMarkerClick?.(listing),
          }}
        >
          <Popup>
            <div className="text-sm min-w-[200px]">
              <p className="font-semibold mb-1">{listing.name}</p>
              <p className="text-xs text-gray-500 mb-1">
                {listing.area && `${listing.area}, `}{listing.city}
              </p>
              <p className="font-bold text-orange-500">
                ₹{listing.rent_min.toLocaleString()}
                {listing.rent_max && ` - ₹${listing.rent_max.toLocaleString()}`}
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
      ))}
    </MapContainer>
  );
}

export function MapComponent(props: MapComponentProps) {
  return <MapContent {...props} />;
}
