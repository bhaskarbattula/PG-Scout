import { SearchBar } from "@/components/SearchBar";
import { CityCard } from "@/components/CityCard";
import { PGCard } from "@/components/PGCard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { City, PGListing } from "@/types";

async function getCities(): Promise<City[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("cities")
    .select("*")
    .order("name");
  return (data as City[]) || [];
}

async function getTrendingListings(): Promise<PGListing[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("pg_listings")
    .select("*")
    .order("rating", { ascending: false })
    .limit(6);
  return (data as PGListing[]) || [];
}

export default async function HomePage() {
  const [cities, trending] = await Promise.all([
    getCities(),
    getTrendingListings(),
  ]);

  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--bg) 0%, rgba(255, 107, 53, 0.05) 50%, rgba(6, 214, 160, 0.05) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              Find Your <span className="text-[var(--primary)]">Perfect PG</span> in India
            </h1>
            <p className="text-lg md:text-xl mb-8" style={{ color: "var(--text-secondary)" }}>
              Search thousands of PGs, hostels, and dorms across India.
              Filter by budget, amenities, and location.
            </p>
            <SearchBar className="max-w-2xl mx-auto" />
            <div className="flex items-center justify-center gap-6 mt-6 text-sm" style={{ color: "var(--text-secondary)" }}>
              <span>🏠 500+ Listings</span>
              <span>📍 15+ Cities</span>
              <span>⭐ Verified Ratings</span>
            </div>
          </div>
        </div>
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: "var(--primary)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10"
          style={{ backgroundColor: "var(--accent)" }}
        />
      </section>

      {cities.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Explore Cities
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {cities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        </section>
      )}

      {trending.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Top Rated PGs
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.map((listing) => (
              <PGCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      <section
        className="py-16"
        style={{ backgroundColor: "rgba(255, 107, 53, 0.03)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            How PG Finder Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                step: "1",
                title: "Search",
                desc: "Search by city, area, or use your current location to find PGs near you.",
              },
              {
                step: "2",
                title: "Filter",
                desc: "Filter by rent, gender, amenities, and more to find your perfect match.",
              },
              {
                step: "3",
                title: "Connect",
                desc: "View details, check location on map, and contact the PG directly.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {step}
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {title}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
