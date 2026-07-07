import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PGListing } from "@/types";
import { ArrowLeft, Phone, Star, MapPin, IndianRupee, Users, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { PGMapWrapper as PGMap } from "@/components/PGMapWrapper";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
};

function mapToCamelCase(l: any): PGListing {
  return {
    id: l.id,
    slug: l.slug,
    name: l.name,
    description: l.description,
    latitude: l.latitude,
    longitude: l.longitude,
    address: l.address,
    city: l.city,
    area: l.area,
    type: l.type,
    gender: l.gender,
    rentMin: l.rent_min,
    rentMax: l.rent_max,
    foodAvailable: l.food_available,
    wifi: l.wifi,
    laundry: l.laundry,
    parking: l.parking,
    ac: l.ac,
    furnished: l.furnished,
    rating: l.rating,
    reviewCount: l.review_count,
    images: l.images || [],
    phone: l.phone,
    distance: null,
  };
}

async function getListing(slug: string): Promise<PGListing | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("pg_listings")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) return null;
  return mapToCamelCase(data);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: "PG Not Found" };

  return {
    title: `${listing.name} - ${listing.city}`,
    description: listing.description || `PG in ${listing.city}. Rent starts at ₹${listing.rentMin}. Near workplaces in ${listing.area || listing.city}.`,
    openGraph: {
      title: `${listing.name} - PG Finder`,
      description: `PG near workplaces in ${listing.city} starting at ₹${listing.rentMin}`,
      images: listing.images?.length ? [{ url: listing.images[0] }] : [],
    },
  };
}

export default async function PGDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { from } = await searchParams;
  const backUrl = from || "/search";
  const listing = await getListing(slug);
  if (!listing) notFound();

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
      latitude: listing.latitude,
      longitude: listing.longitude,
    },
    priceRange: `₹${listing.rentMin}${listing.rentMax ? ` - ₹${listing.rentMax}` : ""}`,
    telephone: listing.phone,
    aggregateRating: listing.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: listing.rating,
          reviewCount: listing.reviewCount,
        }
      : undefined,
  };

  const amenities = [
    { label: "WiFi", enabled: listing.wifi },
    { label: "Food Available", enabled: listing.foodAvailable },
    { label: "Laundry", enabled: listing.laundry },
    { label: "Parking", enabled: listing.parking },
    { label: "AC", enabled: listing.ac },
    { label: "Furnished", enabled: listing.furnished },
  ];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href={backUrl}
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
                  <div key={i} className={`rounded-xl overflow-hidden ${i === 0 ? "md:col-span-2" : ""}`}>
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

            <div className="rounded-xl p-6 card-shadow" style={{ backgroundColor: "var(--card-bg)" }}>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    {listing.name}
                  </h1>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>
                      {listing.address && `${listing.address}, `}
                      {listing.area && `${listing.area}, `}
                      {listing.city}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{listing.gender}</Badge>
                  <Badge variant="accent">{listing.type}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" style={{ color: "var(--primary)" }} />
                  <span className="text-2xl font-bold" style={{ color: "var(--primary)" }}>
                    ₹{listing.rentMin.toLocaleString()}
                  </span>
                  {listing.rentMax && (
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      - ₹{listing.rentMax.toLocaleString()}/month
                    </span>
                  )}
                </div>
                {listing.rating > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ backgroundColor: "rgba(255, 209, 102, 0.15)" }}>
                    <Star className="w-4 h-4 fill-current" style={{ color: "#FFD166" }} />
                    <span className="text-sm font-semibold">{listing.rating.toFixed(1)}</span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      ({listing.reviewCount} {listing.reviewCount === 1 ? "review" : "reviews"})
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

            <div className="rounded-xl p-6 card-shadow" style={{ backgroundColor: "var(--card-bg)" }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenities.map((a) =>
                  a.enabled ? (
                    <div
                      key={a.label}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                      style={{ backgroundColor: "rgba(6, 214, 160, 0.05)", color: "var(--accent)" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {a.label}
                    </div>
                  ) : null
                )}
                {amenities.every((a) => !a.enabled) && (
                  <p className="text-sm col-span-full" style={{ color: "var(--text-secondary)" }}>
                    No amenities information available.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl p-6 card-shadow" style={{ backgroundColor: "var(--card-bg)" }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                Location
              </h2>
              <PGMap
                latitude={listing.latitude}
                longitude={listing.longitude}
                name={listing.name}
                area={listing.area}
                city={listing.city}
              />
              <p className="text-xs mt-3 text-center" style={{ color: "var(--text-secondary)" }}>
                {listing.area ? `${listing.area}, ` : ""}{listing.address ? `${listing.address}, ` : ""}{listing.city}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl p-6 card-shadow sticky top-24" style={{ backgroundColor: "var(--card-bg)" }}>
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
                    ₹{listing.rentMin.toLocaleString()}
                    {listing.rentMax && ` - ₹${listing.rentMax.toLocaleString()}`}
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
                {listing.rating > 0 && (
                  <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Rating</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {listing.rating.toFixed(1)} ({listing.reviewCount})
                    </span>
                  </div>
                )}
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
