import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PGCard } from "@/components/PGCard";
import { SearchBar } from "@/components/SearchBar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { City, PGListing, Area } from "@/types";
import Link from "next/link";

type Props = {
  params: Promise<{ city: string }>;
};

async function getData(citySlug: string) {
  const supabase = await createServerSupabaseClient();

  const { data: city } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", citySlug)
    .single();

  if (!city) return null;

  const { data: listings } = await supabase
    .from("pg_listings")
    .select("*")
    .eq("city", (city as City).name)
    .order("rating", { ascending: false })
    .limit(30);

  const { data: areas } = await supabase
    .from("areas")
    .select("*")
    .eq("city_id", (city as City).id)
    .order("name");

  return {
    city: city as City,
    listings: (listings as PGListing[]) || [],
    areas: (areas as Area[]) || [],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const data = await getData(citySlug);
  if (!data) return { title: "City Not Found" };

  return {
    title: `PG in ${data.city.name} - Paying Guest Accommodations`,
    description: `Find the best PGs, hostels, and dormitories in ${data.city.name}, ${data.city.state}. Filter by rent, gender, and amenities. Book your perfect PG today.`,
    openGraph: {
      title: `PG in ${data.city.name} - PG Finder`,
      description: `Find the best PGs, hostels, and dormitories in ${data.city.name}.`,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { city: citySlug } = await params;
  const data = await getData(citySlug);

  if (!data) notFound();

  const { city, listings, areas } = data;

  return (
    <div>
      <section
        className="relative overflow-hidden py-12 md:py-16"
        style={{
          background: "linear-gradient(135deg, var(--bg) 0%, rgba(255, 107, 53, 0.05) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3">
              PG in{" "}
              <span className="text-[var(--primary)]">{city.name}</span>
            </h1>
            <p className="text-lg mb-6" style={{ color: "var(--text-secondary)" }}>
              Find the best paying guest accommodations in {city.name}, {city.state}
            </p>
            <SearchBar className="max-w-xl mx-auto" />
          </div>
        </div>
      </section>

      {areas.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
            Popular Areas in {city.name}
          </h2>
          <div className="flex flex-wrap gap-3">
            {areas.map((area) => (
              <Link
                key={area.id}
                href={`/area/${area.slug}`}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all border hover:border-[var(--primary)]"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                {area.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {listings.length} PG{listings.length !== 1 ? "s" : ""} in {city.name}
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
              No PGs listed yet in {city.name}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Check back soon or explore nearby cities.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
