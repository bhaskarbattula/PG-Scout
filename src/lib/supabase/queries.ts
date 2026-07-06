import type { SearchFilters, SearchResult, PGListing, City, Area } from "@/types";
import { createClient } from "./client";

function getClient() {
  return createClient();
}

export async function searchListings(filters: SearchFilters): Promise<SearchResult> {
  const supabase = getClient();
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("pg_listings")
    .select("*", { count: "exact" });

  if (filters.query) {
    query = query.textSearch("search_vector", filters.query, {
      type: "websearch",
    });
  }

  if (filters.city) {
    query = query.eq("city", filters.city);
  }

  if (filters.area) {
    query = query.ilike("area", `%${filters.area}%`);
  }

  if (filters.gender) {
    query = query.eq("gender", filters.gender);
  }

  if (filters.type) {
    query = query.eq("type", filters.type);
  }

  if (filters.rentMin !== undefined) {
    query = query.gte("rent_min", filters.rentMin);
  }

  if (filters.rentMax !== undefined) {
    query = query.lte("rent_min", filters.rentMax);
  }

  if (filters.food_available) {
    query = query.eq("food_available", true);
  }
  if (filters.wifi) {
    query = query.eq("wifi", true);
  }
  if (filters.laundry) {
    query = query.eq("laundry", true);
  }
  if (filters.parking) {
    query = query.eq("parking", true);
  }
  if (filters.ac) {
    query = query.eq("ac", true);
  }
  if (filters.furnished) {
    query = query.eq("furnished", true);
  }

  query = query.order("rating", { ascending: false });
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Search error:", error);
    return { listings: [], total: 0, page, pageSize };
  }

  return {
    listings: (data as PGListing[]) || [],
    total: count || 0,
    page,
    pageSize,
  };
}

export async function getNearbyListings(
  lat: number,
  lng: number,
  radiusKm: number = 5
): Promise<PGListing[]> {
  const supabase = getClient();
  const { data, error } = await supabase.rpc("nearby_listings", {
    lat,
    lng,
    radius_km: radiusKm,
  });

  if (error) {
    console.error("Nearby search error:", error);
    return [];
  }

  return data as PGListing[];
}

export async function getListingBySlug(slug: string): Promise<PGListing | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pg_listings")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as PGListing;
}

export async function getListingsByCity(
  city: string,
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResult> {
  return searchListings({ city, page, pageSize });
}

export async function getListingsByArea(
  city: string,
  area: string,
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResult> {
  return searchListings({ city, area, page, pageSize });
}

export async function getCities(): Promise<City[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .order("name");

  if (error) return [];
  return data as City[];
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as City;
}

export async function getAreasByCity(cityId: string): Promise<Area[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("areas")
    .select("*")
    .eq("city_id", cityId)
    .order("name");

  if (error) return [];
  return data as Area[];
}

export async function getAreaBySlug(slug: string): Promise<Area | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("areas")
    .select("*, cities!inner(*)")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Area & { cities: City };
}

export async function getTrendingListings(limit: number = 6): Promise<PGListing[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pg_listings")
    .select("*")
    .order("rating", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data as PGListing[];
}

export async function getFeaturedListings(limit: number = 12): Promise<PGListing[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pg_listings")
    .select("*")
    .gte("rating", 4.0)
    .order("review_count", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data as PGListing[];
}
