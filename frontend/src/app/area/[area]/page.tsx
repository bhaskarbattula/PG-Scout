import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PGListing } from "@/types";
import { PGCard } from "@/components/PGCard";
import { SearchBar } from "@/components/SearchBar";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{ area: string }>;
};

function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function getData(areaSlug: string) {
  const supabase = await createServerSupabaseClient();
  const areaName = slugToName(areaSlug);

  const { data: listings } = await supabase
    .from("pg_listings")
    .select("*")
    .ilike("area", areaName)
    .order("rating", { ascending: false })
    .limit(30);

  if (!listings || listings.length === 0) return null;

  return {
    areaName,
    listings: (listings as any[]).map(mapToCamelCase),
  };
}

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area } = await params;
  const data = await getData(area);
  if (!data) return { title: "Area Not Found" };
  return {
    title: `PG in ${data.areaName}, Hyderabad - Near Workplaces`,
    description: `Find PGs and hostels in ${data.areaName}, Hyderabad. Search by company name for workplace accommodation near ${data.areaName}.`,
  };
}

export default async function AreaPage({ params }: Props) {
  const { area } = await params;
  const data = await getData(area);
  if (!data) notFound();

  const { areaName, listings } = data;

  return (
    <div>
      <section
        className="relative overflow-hidden py-12 md:py-16"
        style={{
          background: "linear-gradient(135deg, var(--bg) 0%, rgba(6, 214, 160, 0.05) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              <Link href="/city/hyderabad" className="hover:text-[var(--primary)]">
                Hyderabad
              </Link>
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 capitalize">
              PG in{" "}
              <span className="text-[var(--accent)]">{areaName}</span>
            </h1>
            <p className="text-lg mb-6" style={{ color: "var(--text-secondary)" }}>
              Find PGs near company offices in {areaName}, Hyderabad
            </p>
            <SearchBar className="max-w-xl mx-auto" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:text-[var(--primary)] transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Search by Company Name
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            PGs in {areaName}
          </h2>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <PGCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              No PGs listed yet in {areaName}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Try searching by company name instead.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
