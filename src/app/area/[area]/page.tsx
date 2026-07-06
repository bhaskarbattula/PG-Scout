import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PGCard } from "@/components/PGCard";
import { SearchBar } from "@/components/SearchBar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PGListing, Area, City } from "@/types";
import Link from "next/link";

type Props = {
  params: Promise<{ area: string }>;
};

async function getData(areaSlug: string) {
  const supabase = await createServerSupabaseClient();

  const { data: area } = await supabase
    .from("areas")
    .select("*, cities!inner(*)")
    .eq("slug", areaSlug)
    .single();

  if (!area) return null;

  const areaName = (area as unknown as Area).name;
  const cityName = ((area as unknown as Area & { cities: City }).cities).name;

  const { data: listings } = await supabase
    .from("pg_listings")
    .select("*")
    .ilike("area", areaName)
    .order("rating", { ascending: false })
    .limit(30);

  return {
    area: area as unknown as Area & { cities: City },
    cityName,
    areaName,
    listings: (listings as PGListing[]) || [],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area: areaSlug } = await params;
  const data = await getData(areaSlug);
  if (!data) return { title: "Area Not Found" };

  return {
    title: `PG in ${data.areaName}, ${data.cityName} - Paying Guest Accommodations`,
    description: `Find the best PGs, hostels, and dormitories in ${data.areaName}, ${data.cityName}. Filter by rent, gender, and amenities.`,
    openGraph: {
      title: `PG in ${data.areaName}, ${data.cityName} - PG Finder`,
      description: `Find the best PGs and hostels in ${data.areaName}, ${data.cityName}.`,
    },
  };
}

export default async function AreaPage({ params }: Props) {
  const { area: areaSlug } = await params;
  const data = await getData(areaSlug);

  if (!data) notFound();

  const { area, areaName, cityName, listings } = data;

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
              <Link href={`/city/${area.cities.slug}`} className="hover:text-[var(--primary)]">
                {cityName}
              </Link>
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 capitalize">
              PG in{" "}
              <span className="text-[var(--accent)]">{areaName}</span>
            </h1>
            <p className="text-lg mb-6" style={{ color: "var(--text-secondary)" }}>
              Find the best paying guest accommodations in {areaName}, {cityName}
            </p>
            <SearchBar className="max-w-xl mx-auto" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {listings.length} PG{listings.length !== 1 ? "s" : ""} in {areaName}
          </h2>
          <Link
            href={`/search?city=${cityName}&area=${areaName}`}
            className="text-sm font-medium hover:text-[var(--primary)] transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            View on Map
          </Link>
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
              Check back soon or explore nearby areas.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
