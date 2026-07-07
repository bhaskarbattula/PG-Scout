import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PGListing } from "@/types";
import { PGCard } from "@/components/PGCard";
import { SearchBar } from "@/components/SearchBar";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ city: string }>;
};

async function getData() {
  const supabase = await createServerSupabaseClient();

  const { data: listings } = await supabase
    .from("pg_listings")
    .select("*")
    .eq("city", "Hyderabad")
    .order("rating", { ascending: false })
    .limit(30);

  return {
    listings: ((listings || []) as any[]).map(mapToCamelCase),
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
  const { city } = await params;
  if (city !== "hyderabad") notFound();
  return {
    title: "PG Near Workplaces in Hyderabad - PG Finder",
    description: "Find PGs and hostels near Hyderabad IT corridor offices. Search by company name and find accommodation near your workplace in Hitech City, Gachibowli, Financial District, and more.",
    openGraph: {
      title: "PG Near Workplaces in Hyderabad - PG Finder",
      description: "Find PGs near offices in Hyderabad IT corridor.",
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;

  // Redirect non-Hyderabad city slugs to Hyderabad
  if (city !== "hyderabad") {
    redirect("/city/hyderabad");
  }

  const data = await getData();
  const { listings } = data;

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
              PG Near Your Workplace in{" "}
              <span className="text-[var(--primary)]">Hyderabad</span>
            </h1>
            <p className="text-lg mb-6" style={{ color: "var(--text-secondary)" }}>
              Find PGs near 50+ company offices across Hitech City, Gachibowli, Financial District, Kondapur, and more. Search by company name to find accommodation near your workplace.
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
            PGs in Hyderabad
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
            <Building2 className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-secondary)" }} />
            <p className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              No PGs listed yet in Hyderabad
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Try searching by company name instead.
            </p>
            <Link href="/search">
              <Button>Search by Company</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
