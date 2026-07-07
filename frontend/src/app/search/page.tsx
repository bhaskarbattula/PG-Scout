"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PGCard } from "@/components/PGCard";
import { MapComponent } from "@/components/MapComponent";
import { CompanySearch } from "@/components/CompanySearch";
import { BranchSelector } from "@/components/BranchSelector";
import { useSearch } from "@/hooks/useSearch";
import type { Branch, PGListing, SearchFilters } from "@/types";
import { SlidersHorizontal, List, Map as MapIcon, Loader2, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Build URL search params string from the current state, preserving existing params. */
function buildSearchParams(
  existing: URLSearchParams,
  overrides: Record<string, string | null>
): string {
  const p = new URLSearchParams(existing);
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null || value === "" || value === undefined) {
      p.delete(key);
    } else {
      p.set(key, value);
    }
  }
  return p.toString();
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query");
  const branchId = searchParams.get("branchId");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  // Restore filters from URL on mount / back-nav
  const filters = useMemo<SearchFilters>(() => ({
    gender: (searchParams.get("gender") as SearchFilters["gender"]) || undefined,
    rentMin: searchParams.get("minRent") ? Number(searchParams.get("minRent")) : undefined,
    rentMax: searchParams.get("maxRent") ? Number(searchParams.get("maxRent")) : undefined,
    foodAvailable: searchParams.get("food") === "true" ? true : undefined,
    wifi: searchParams.get("wifi") === "true" ? true : undefined,
    laundry: searchParams.get("laundry") === "true" ? true : undefined,
    parking: searchParams.get("parking") === "true" ? true : undefined,
    ac: searchParams.get("ac") === "true" ? true : undefined,
    furnished: searchParams.get("furnished") === "true" ? true : undefined,
  }), [searchParams]);

  const viewMode = (searchParams.get("view") as "list" | "map") || "list";
  const showFilters = searchParams.get("showFilters") === "true";

  const [selectedListing, setSelectedListing] = useState<string | null>(null);

  /** Sync filters to URL without adding a history entry or scrolling. */
  const syncFilters = useCallback((newFilters: SearchFilters) => {
    const qs = buildSearchParams(searchParams, {
      gender: newFilters.gender || null,
      minRent: newFilters.rentMin != null ? String(newFilters.rentMin) : null,
      maxRent: newFilters.rentMax != null ? String(newFilters.rentMax) : null,
      food: newFilters.foodAvailable === true ? "true" : newFilters.foodAvailable === false ? "false" : null,
      wifi: newFilters.wifi === true ? "true" : null,
      laundry: newFilters.laundry === true ? "true" : null,
      parking: newFilters.parking === true ? "true" : null,
      ac: newFilters.ac === true ? "true" : null,
      furnished: newFilters.furnished === true ? "true" : null,
    });
    router.replace(`/search?${qs}`, { scroll: false });
  }, [searchParams, router]);

  const { data: result, isLoading } = useSearch(query, branchId, filters, lat ? Number(lat) : null, lng ? Number(lng) : null);

  const hasLocation = lat && lng;
  const showBranchSelector = result?.type === "multiple_branches" && result.branches && result.branches.length > 1;

  const handleBranchSelect = useCallback(
    (branch: Branch) => {
      router.push(`/search?branchId=${branch.id}`, { scroll: false });
    },
    [router]
  );

  const handleFilterChange = useCallback(
    (newFilters: SearchFilters) => {
      syncFilters(newFilters);
    },
    [syncFilters]
  );

  const toggleViewMode = useCallback((mode: "list" | "map") => {
    const qs = buildSearchParams(searchParams, {
      view: mode === "list" ? null : "map",
    });
    router.replace(`/search?${qs}`, { scroll: false });
  }, [searchParams, router]);

  const toggleFiltersPanel = useCallback(() => {
    const qs = buildSearchParams(searchParams, {
      showFilters: showFilters ? null : "true",
    });
    router.replace(`/search?${qs}`, { scroll: false });
  }, [searchParams, router, showFilters]);

  /** Calculate map center — prioritize: selectedBranch > visible branches > lat/lng > Hyderabad */
  const mapCenter: [number, number] | undefined = useMemo(() => {
    if (result?.selectedBranch) {
      return [result.selectedBranch.latitude, result.selectedBranch.longitude];
    }
    if (result?.branches && result.branches.length > 0) {
      // Average of all branch locations to show them all
      const avgLat = result.branches.reduce((s, b) => s + b.latitude, 0) / result.branches.length;
      const avgLng = result.branches.reduce((s, b) => s + b.longitude, 0) / result.branches.length;
      return [avgLat, avgLng];
    }
    if (hasLocation) {
      return [Number(lat), Number(lng)];
    }
    return [17.440, 78.345]; // Default: Gachibowli, Hyderabad
  }, [result, hasLocation, lat, lng]);

  /** Zoom: 14 for single branch/PGs, 13 for branch cluster, 15 for Gachibowli default */
  const mapZoom = useMemo(() => {
    if (result?.selectedBranch) return 14;
    if (result?.branches && result.branches.length > 1) return 13;
    if (hasLocation || query || branchId) return 14;
    return 15;
  }, [result, hasLocation, query, branchId]);

  /** Markers: when showing branches (no PGs yet), show branch icons; otherwise show PG markers */
  const markers = useMemo(() => {
    if (result?.pgListings && result.pgListings.length > 0) {
      return result.pgListings.map((l) => ({ ...l, lat: l.latitude, lng: l.longitude }));
    }
    if (result?.branches && result.branches.length > 0 && !result.pgListings?.length) {
      // Create virtual PG-like markers for branches so they show on the map
      return result.branches.map((b) => ({
        id: b.id,
        slug: `branch-${b.id}`,
        name: b.name || result.company?.name || "Office",
        description: null,
        latitude: b.latitude,
        longitude: b.longitude,
        address: b.address,
        city: b.cityName,
        area: null,
        type: "pg" as const,
        gender: "unisex" as const,
        rentMin: 0,
        rentMax: null,
        foodAvailable: false,
        wifi: false,
        laundry: false,
        parking: false,
        ac: false,
        furnished: false,
        rating: 0,
        reviewCount: 0,
        images: [],
        phone: null,
        distance: null,
        lat: b.latitude,
        lng: b.longitude,
        isBranch: true,
      }));
    }
    return [];
  }, [result]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="border-b border-[var(--border)]" style={{ backgroundColor: "var(--card-bg)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-2xl">
              <CompanySearch />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFiltersPanel}
                className="md:hidden"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
              <div className="flex items-center rounded-lg border border-[var(--border)] overflow-hidden">
                <button
                  onClick={() => toggleViewMode("list")}
                  className="p-2 transition-colors"
                  style={{
                    backgroundColor: viewMode === "list" ? "var(--primary)" : "transparent",
                  }}
                >
                  <List className="w-4 h-4" style={{ color: viewMode === "list" ? "#fff" : "var(--text-secondary)" }} />
                </button>
                <button
                  onClick={() => toggleViewMode("map")}
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
        </div>
      </div>

      <div className="flex-1 flex">
        <FilterSidebar
          filters={filters}
          onChange={handleFilterChange}
          show={showFilters}
          onClose={toggleFiltersPanel}
        />

        <div className="flex-1 flex overflow-hidden">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: "var(--primary)" }} />
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Searching...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex w-full"
              >
                {/* List pane — shows BranchSelector or PG results or empty state */}
                <div
                  className={`overflow-y-auto ${viewMode === "map" ? "hidden lg:block" : ""} w-full lg:w-1/2 p-4 md:p-6`}
                >
                  {!query && !branchId && !hasLocation ? (
                    /* ——— Empty state ——— */
                    <div className="flex items-center justify-center h-full min-h-[300px]">
                      <div className="text-center max-w-md">
                        <Building2 className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-secondary)" }} />
                        <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                          Search for PGs Near Your Workplace
                        </h2>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          Enter a company name above to find PGs near your Hyderabad office. Example: &quot;Amazon Hitech City&quot;
                        </p>
                      </div>
                    </div>
                  ) : showBranchSelector && result ? (
                    /* ——— Branch selector (multiple branches) ——— */
                    <div className="max-w-2xl mx-auto py-2">
                      <div className="flex items-center gap-2 mb-4">
                        <Briefcase className="w-5 h-5" style={{ color: "var(--primary)" }} />
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          Select an office location for <strong>{result.company?.name || query}</strong>
                        </p>
                      </div>
                      <BranchSelector
                        companyName={result.company?.name || query || ""}
                        branches={result.branches}
                        onSelect={handleBranchSelect}
                      />
                    </div>
                  ) : result && result.pgListings && result.pgListings.length > 0 ? (
                    /* ——— PG results ——— */
                    <>
                      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                        Found <strong>{result.totalCount}</strong> PG{result.totalCount !== 1 ? "s" : ""}
                        {result.selectedBranch ? ` near ${result.selectedBranch.name}` : ""}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {result.pgListings.map((listing) => (
                          <PGCard key={listing.id} listing={listing} />
                        ))}
                      </div>
                    </>
                  ) : (
                    /* ——— No results ——— */
                    <div className="flex items-center justify-center h-full min-h-[300px]">
                      <div className="text-center">
                        <p className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                          No PGs found
                        </p>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          Try a different company, location, or adjust your filters.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Map pane — ALWAYS rendered alongside content, visibility toggled */}
                <div
                  className={`${viewMode === "list" ? "hidden lg:block" : ""} w-full lg:w-1/2 relative h-full min-h-[300px]`}
                >
                  <MapComponent
                    listings={markers}
                    center={mapCenter}
                    zoom={mapZoom}
                    selectedId={selectedListing || undefined}
                    onMarkerClick={(listing) => setSelectedListing(listing.id)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
