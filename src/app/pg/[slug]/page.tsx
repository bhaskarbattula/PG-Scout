import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PGListing } from "@/types";
import { MapComponent } from "@/components/MapComponent";
import {
  Wifi,
  UtensilsCrossed,
  Shirt,
  Car,
  Snowflake,
  Sofa,
  MapPin,
  Star,
  Phone,
  ArrowLeft,
  Users,
  Home,
  IndianRupee,
} from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getListing(slug: string): Promise<PGListing | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("pg_listings")
    .select("*")
    .eq("slug", slug)
    .single();

  return data as PGListing | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: "PG Not Found" };

  return {
    title: `${listing.name} - ${listing.area ? `${listing.area}, ` : ""}${listing.city}`,
    description:
      listing.description ||
      `${listing.name} in ${listing.city}. Rent starts at ₹${listing.rent_min}. ${listing.gender} ${listing.type}. ${listing.wifi ? "WiFi available. " : ""}${listing.food_available ? "Food available. " : ""}Contact now!`,
    openGraph: {
      title: `${listing.name} - PG Finder`,
      description: listing.description || `PG in ${listing.city} starting at ₹${listing.rent_min}`,
      images: listing.images?.length ? [{ url: listing.images[0] }] : [],
    },
  };
}

function AmenityBadge({
  icon,
  label,
  enabled,
}: {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
}) {
  if (!enabled) return null;
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border"
      style={{
        backgroundColor: "rgba(6, 214, 160, 0.05)",
        borderColor: "rgba(6, 214, 160, 0.2)",
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: "rgba(6, 214, 160, 0.1)" }}
      >
        <span style={{ color: "var(--accent)" }}>{icon}</span>
      </div>
      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
        {label}
      </span>
    </div>
  );
}

export default async function PGDetailPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getListing(slug);

  if (!listing) notFound();

  const allAmenities = [
    { icon: <Wifi className="w-5 h-5" />, label: "WiFi", key: "wifi" as const },
    { icon: <UtensilsCrossed className="w-5 h-5" />, label: "Food Available", key: "food_available" as const },
    { icon: <Shirt className="w-5 h-5" />, label: "Laundry", key: "laundry" as const },
    { icon: <Car className="w-5 h-5" />, label: "Parking", key: "parking" as const },
    { icon: <Snowflake className="w-5 h-5" />, label: "AC", key: "ac" as const },
    { icon: <Sofa className="w-5 h-5" />, label: "Furnished", key: "furnished" as const },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.name,
    description: listing.description,
    image: listing.images?.[0],
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address,
      addressLocality: listing.area,
      addressRegion: listing.city,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: listing.lat,
      longitude: listing.lng,
    },
    priceRange: `₹${listing.rent_min}${listing.rent_max ? ` - ₹${listing.rent_max}` : ""}`,
    telephone: listing.phone,
    aggregateRating: listing.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: listing.rating,
          reviewCount: listing.review_count,
        }
      : undefined,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--primary)]"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {listing.images && listing.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listing.images.map((img, i) => (
                  <div
                    key={i}
                    className={`rounded-xl overflow-hidden ${i === 0 ? "md:col-span-2" : ""}`}
                  >
                    <img
                      src={img}
                      alt={`${listing.name} - Image ${i + 1}`}
                      className="w-full h-64 md:h-80 object-cover"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </div>
            )}

            <div
              className="rounded-xl p-6 card-shadow"
              style={{ backgroundColor: "var(--card-bg)" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    {listing.name}
                  </h1>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <MapPin className="w-4 h-4" />
                    <span>
                      {listing.address && `${listing.address}, `}
                      {listing.area && `${listing.area}, `}
                      {listing.city}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-lg text-sm font-semibold capitalize text-white"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {listing.gender}
                  </span>
                  <span
                    className="px-3 py-1 rounded-lg text-sm font-semibold capitalize text-white"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    {listing.type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" style={{ color: "var(--primary)" }} />
                  <span className="text-2xl font-bold" style={{ color: "var(--primary)" }}>
                    ₹{listing.rent_min.toLocaleString()}
                  </span>
                  {listing.rent_max && (
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      - ₹{listing.rent_max.toLocaleString()}/month
                    </span>
                  )}
                </div>
                {listing.rating > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ backgroundColor: "rgba(255, 209, 102, 0.15)" }}>
                    <Star className="w-4 h-4 fill-current" style={{ color: "#FFD166" }} />
                    <span className="text-sm font-semibold">{listing.rating.toFixed(1)}</span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      ({listing.review_count} reviews)
                    </span>
                  </div>
                )}
              </div>

              {listing.description && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {listing.description}
                </p>
              )}
            </div>

            <div
              className="rounded-xl p-6 card-shadow"
              style={{ backgroundColor: "var(--card-bg)" }}
            >
              <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                Amenities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allAmenities.map((a) => (
                  <AmenityBadge key={a.key} icon={a.icon} label={a.label} enabled={listing[a.key]} />
                ))}
              </div>
            </div>

            <div
              className="rounded-xl p-6 card-shadow"
              style={{ backgroundColor: "var(--card-bg)" }}
            >
              <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                Location
              </h2>
              <div className="h-[300px] md:h-[400px] rounded-xl overflow-hidden">
                <MapComponent
                  listings={[listing]}
                  center={[listing.lat, listing.lng]}
                  zoom={15}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div
              className="rounded-xl p-6 card-shadow sticky top-24"
              style={{ backgroundColor: "var(--card-bg)" }}
            >
              <h3 className="font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
                Quick Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Rent</span>
                  </div>
                  <span className="text-sm font-semibold">
                    ₹{listing.rent_min.toLocaleString()}
                    {listing.rent_max && ` - ₹${listing.rent_max.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Gender</span>
                  </div>
                  <span className="text-sm font-semibold capitalize">{listing.gender}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Type</span>
                  </div>
                  <span className="text-sm font-semibold capitalize">{listing.type}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Rating</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {listing.rating > 0 ? `${listing.rating.toFixed(1)} (${listing.review_count})` : "No reviews"}
                  </span>
                </div>
              </div>

              {listing.phone && (
                <a
                  href={`tel:${listing.phone}`}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <Phone className="w-4 h-4" />
                  Call {listing.phone}
                </a>
              )}

              <p className="text-xs text-center mt-3" style={{ color: "var(--text-secondary)" }}>
                No login required. Call directly to inquire.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
