"use client";

import { useTrendingPGs } from "@/hooks/useSearch";
import { PGCard } from "@/components/PGCard";
import { Skeleton } from "@/components/ui/skeleton";

export function TrendingPGs() {
  const { data: listings, isLoading } = useTrendingPGs();

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>
          Top Rated PGs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!listings || listings.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Top Rated PGs
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <PGCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
