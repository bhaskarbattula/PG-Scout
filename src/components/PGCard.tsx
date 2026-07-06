import Link from "next/link";
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
} from "lucide-react";

interface PGCardProps {
  listing: PGListing;
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

export function PGCard({ listing }: PGCardProps) {
  const imgSrc =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : "/placeholder-pg.svg";

  return (
    <Link href={`/pg/${listing.slug}`}>
      <div
        className="rounded-xl overflow-hidden card-shadow transition-all duration-200 hover:card-shadow-lg hover:-translate-y-0.5"
        style={{ backgroundColor: "var(--card-bg)" }}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={imgSrc}
            alt={listing.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
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
            <MapPin className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />
            <span className="text-xs line-clamp-1" style={{ color: "var(--text-secondary)" }}>
              {listing.area ? `${listing.area}, ` : ""}
              {listing.city}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <AmenityIcon name="wifi" enabled={listing.wifi} />
            <AmenityIcon name="food_available" enabled={listing.food_available} />
            <AmenityIcon name="ac" enabled={listing.ac} />
            <AmenityIcon name="parking" enabled={listing.parking} />
          </div>
          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border)" }}>
            <div>
              <span className="text-lg font-bold" style={{ color: "var(--primary)" }}>
                ₹{listing.rent_min.toLocaleString()}
              </span>
              {listing.rent_max && (
                <span className="text-xs ml-1" style={{ color: "var(--text-secondary)" }}>
                  - ₹{listing.rent_max.toLocaleString()}
                </span>
              )}
            </div>
            {listing.review_count > 0 && (
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {listing.review_count} reviews
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
