"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PGCard } from "@/components/PGCard";
import { MapComponent } from "@/components/MapComponent";
import { SearchBar } from "@/components/SearchBar";
import { searchListings } from "@/lib/supabase/queries";
import type { SearchFilters, PGListing, SearchResult } from "@/types";
import { SlidersHorizontal, List, Map as MapIcon, Loader2 } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);

  useEffect(() => {
    const q: SearchFilters = {};
    const query = searchParams.get("query");
    const city = searchParams.get("city");
    const area = searchParams.get("area");
    const gender = searchParams.get("gender");
    const type = searchParams.get("type");
    const rentMin = searchParams.get("rentMin");
    const rentMax = searchParams.get("rentMax");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (query) q.query = query;
    if (city) q.city = city;
    if (area) q.area = area;
    if (gender && ["boys", "girls", "unisex"].includes(gender)) q.gender = gender as SearchFilters["gender"];
    if (type && ["pg", "hostel", "dorm"].includes(type)) q.type = type as SearchFilters["type"];
    if (rentMin) q.rentMin = Number(rentMin);
    if (rentMax) q.rentMax = Number(rentMax);
    if (lat && lng) {
      q.lat = Number(lat);
      q.lng = Number(lng);
    }

    setFilters(q);
  }, [searchParams]);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      const res = await searchListings(filters);
      setResults(res);
      setLoading(false);
    }
    fetchResults();
  }, [filters]);

  const handleFilterChange = useCallback(
    (newFilters: SearchFilters) => {
      const params = new URLSearchParams();
      if (newFilters.query) params.set("query", newFilters.query);
      if (newFilters.city) params.set("city", newFilters.city);
      if (newFilters.area) params.set("area", newFilters.area);
      if (newFilters.gender) params.set("gender", newFilters.gender);
      if (newFilters.type) params.set("type", newFilters.type);
      if (newFilters.rentMin) params.set("rentMin", String(newFilters.rentMin));
      if (newFilters.rentMax) params.set("rentMax", String(newFilters.rentMax));
      if (newFilters.lat && newFilters.lng) {
        params.set("lat", String(newFilters.lat));
        params.set("lng", String(newFilters.lng));
      }

      const qs = params.toString();
      router.push(qs ? `/search?${qs}` : "/search", { scroll: false });
    },
    [router]
  );

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <FilterSidebar
        filters={filters}
        onChange={handleFilterChange}
        show={showFilters}
        onClose={() => setShowFilters(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}>
          <div className="flex items-center gap-3 max-w-7xl mx-auto w-full">
            <div className="flex-1 max-w-xl">
              <SearchBar />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="md:hidden p-2 rounded-lg border"
              style={{ borderColor: "var(--border)" }}
            >
              <SlidersHorizontal className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
            </button>
            <div className="flex items-center rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => setViewMode("list")}
                className="p-2 transition-colors"
                style={{
                  backgroundColor: viewMode === "list" ? "var(--primary)" : "transparent",
                }}
              >
                <List className="w-4 h-4" style={{ color: viewMode === "list" ? "#fff" : "var(--text-secondary)" }} />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className="p-2 transition-colors"
                style={{
                  backgroundColor: viewMode === "map" ? "var(--primary)" : "transparent",
                }}
              >
                <MapIcon className="w-4 h-4" style={{ color: viewMode === "map" ? "#fff" : "var(--text-secondary)" }} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: "var(--primary)" }} />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Searching PGs...</p>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`overflow-y-auto ${viewMode === "map" ? "hidden lg:block" : ""} w-full lg:w-1/2 p-4`}
                style={{ backgroundColor: "var(--bg)" }}
              >
                {results && results.listings.length > 0 ? (
                  <>
                    <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                      Found <strong>{results.total}</strong> PG{results.total !== 1 ? "s" : ""}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {results.listings.map((listing) => (
                        <PGCard key={listing.id} listing={listing} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                      No PGs found
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Try adjusting your filters or search in a different location.
                    </p>
                  </div>
                )}
              </div>
              <div
                className={`${viewMode === "list" ? "hidden lg:block" : ""} w-full lg:w-1/2 relative`}
              >
                {results && results.listings.length > 0 && (
                  <MapComponent
                    listings={results.listings}
                    center={
                      filters.lat && filters.lng
                        ? [filters.lat, filters.lng]
                        : results.listings.length > 0
                          ? [results.listings[0].lat, results.listings[0].lng]
                          : undefined
                    }
                    zoom={13}
                    selectedId={selectedListing || undefined}
                    onMarkerClick={(listing) => setSelectedListing(listing.id)}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
