"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import type { PGListing } from "@/types";
import {
  Wifi,
  UtensilsCrossed,
  Shirt,
  Car,
  Snowflake,
  Sofa,
  MapPin,
  Star,
  Navigation,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PGCardProps {
  listing: PGListing;
  index?: number;
}

function AmenityIcon({ name, enabled }: { name: string; enabled: boolean }) {
  if (!enabled) return null;
  const icons: Record<string, React.ReactNode> = {
    wifi: <Wifi className="w-3.5 h-3.5" />,
    food_available: <UtensilsCrossed className="w-3.5 h-3.5" />,
    laundry: <Shirt className="w-3.5 h-3.5" />,
    parking: <Car className="w-3.5 h-3.5" />,
    ac: <Snowflake className="w-3.5 h-3.5" />,
    furnished: <Sofa className="w-3.5 h-3.5" />,
  };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs"
      style={{
        backgroundColor: "rgba(6, 214, 160, 0.1)",
        color: "var(--accent)",
      }}
      title={name}
    >
      {icons[name]}
    </span>
  );
}

export function PGCard({ listing, index = 0 }: PGCardProps) {
  const [imgError, setImgError] = useState(false);
  const hasImage = listing.images && listing.images.length > 0 && !imgError;
  const searchParams = useSearchParams();
  const backToUrl = searchParams.toString()
    ? `/search?${searchParams.toString()}`
    : "/search";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/pg/${listing.slug}?from=${encodeURIComponent(backToUrl)}`}>
        <div
          className="rounded-xl overflow-hidden card-shadow transition-all duration-200 hover:card-shadow-lg hover:-translate-y-0.5 group"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          <div className="relative min-h-[12rem] bg-gray-100 dark:bg-gray-800 overflow-hidden">
            {hasImage ? (
              <img
                src={listing.images[0]}
                alt={listing.name}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                <div className="text-center">
                  <span className="text-4xl">🏠</span>
                  <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">PG Accommodation</p>
                </div>
              </div>
            )}
            <div className="absolute top-3 left-3 flex gap-2">
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize text-white"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {listing.gender}
              </span>
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize text-white"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {listing.type}
              </span>
            </div>
            {listing.rating > 0 && (
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
                style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#FFD166" }}
              >
                <Star className="w-3 h-3 fill-current" />
                {listing.rating.toFixed(1)}
              </div>
            )}
          </div>
          <div className="p-4">
            <h3
              className="font-semibold text-sm line-clamp-1 mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {listing.name}
            </h3>
            <div className="flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3 shrink-0" style={{ color: "var(--text-secondary)" }} />
              <span className="text-xs line-clamp-1" style={{ color: "var(--text-secondary)" }}>
                {listing.area ? `${listing.area}, ` : ""}
                {listing.city}
              </span>
            </div>
            {listing.distance && (
              <div className="flex items-center gap-1 mb-2">
                <Navigation className="w-3 h-3" style={{ color: "var(--accent)" }} />
                <span className="text-xs" style={{ color: "var(--accent)" }}>
                  {listing.distance < 1
                    ? `${(listing.distance * 1000).toFixed(0)}m away`
                    : `${listing.distance.toFixed(1)}km away`}
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <AmenityIcon name="wifi" enabled={listing.wifi} />
              <AmenityIcon name="food_available" enabled={listing.foodAvailable} />
              <AmenityIcon name="ac" enabled={listing.ac} />
              <AmenityIcon name="parking" enabled={listing.parking} />
            </div>
            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <div>
                <span className="text-lg font-bold" style={{ color: "var(--primary)" }}>
                  ₹{listing.rentMin.toLocaleString()}
                </span>
                {listing.rentMax && (
                  <span className="text-xs ml-1" style={{ color: "var(--text-secondary)" }}>
                    - ₹{listing.rentMax.toLocaleString()}
                  </span>
                )}
              </div>
              {listing.reviewCount > 0 && (
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {listing.reviewCount} reviews
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
