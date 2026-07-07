"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { SearchFilters } from "@/types";

export function useSearch(
  query: string | null,
  branchId: string | null,
  filters: SearchFilters = {},
  lat?: number | null,
  lng?: number | null,
) {
  return useQuery({
    queryKey: ["search", query, branchId, filters, lat, lng],
    queryFn: () =>
      api.search({
        query: query || undefined,
        branchId: branchId || undefined,
        lat: lat ?? undefined,
        lng: lng ?? undefined,
        gender: filters.gender || undefined,
        minRent: filters.rentMin,
        maxRent: filters.rentMax,
      }),
    enabled: !!query || !!branchId || (lat != null && lng != null),
  });
}

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: () => api.getCompanies(),
  });
}

export function useCompanySearch(q: string) {
  return useQuery({
    queryKey: ["companies", "search", q],
    queryFn: () => api.searchCompanies(q),
    enabled: q.length >= 2,
  });
}

export function useBranches(companyId: string | null, city?: string) {
  return useQuery({
    queryKey: ["branches", companyId, city],
    queryFn: () => api.getBranches(companyId!, city),
    enabled: !!companyId,
  });
}

export function useTrendingPGs() {
  return useQuery({
    queryKey: ["pgs", "trending"],
    queryFn: () => api.getTrendingPGs(),
  });
}

export function usePG(slug: string) {
  return useQuery({
    queryKey: ["pgs", slug],
    queryFn: () => api.getPG(slug),
    enabled: !!slug,
  });
}
