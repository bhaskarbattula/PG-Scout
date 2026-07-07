import type { PGListing, City } from "@/types";
import { createClient } from "./client";

function getClient() {
  return createClient();
}

export async function searchListings(params: {
  query?: string;
  city?: string;
  area?: string;
  gender?: string;
  type?: string;
  rentMin?: number;
  rentMax?: number;
  foodAvailable?: boolean;
  wifi?: boolean;
  laundry?: boolean;
  parking?: boolean;
  ac?: boolean;
  furnished?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{ listings: PGListing[]; total: number; page: number; pageSize: number }> {
  const supabase = getClient();
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("pg_listings")
    .select("*", { count: "exact" });

  if (params.query) {
    query = query.textSearch("search_vector", params.query, {
      type: "websearch",
    });
  }

  if (params.city) {
    query = query.eq("city", params.city);
  }

  if (params.area) {
    query = query.ilike("area", `%${params.area}%`);
  }

  if (params.gender) {
    query = query.eq("gender", params.gender);
  }

  if (params.type) {
    query = query.eq("type", params.type);
  }

  if (params.rentMin !== undefined) {
    query = query.gte("rent_min", params.rentMin);
  }

  if (params.rentMax !== undefined) {
    query = query.lte("rent_min", params.rentMax);
  }

  if (params.foodAvailable) query = query.eq("food_available", true);
  if (params.wifi) query = query.eq("wifi", true);
  if (params.laundry) query = query.eq("laundry", true);
  if (params.parking) query = query.eq("parking", true);
  if (params.ac) query = query.eq("ac", true);
  if (params.furnished) query = query.eq("furnished", true);

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

function toCamelCase(l: any): PGListing {
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

export async function getListingBySlug(slug: string): Promise<PGListing | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pg_listings")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return toCamelCase(data);
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

export async function getTrendingListings(limit: number = 6): Promise<PGListing[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pg_listings")
    .select("*")
    .order("rating", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []).map(toCamelCase);
}

export async function getListingsByCity(city: string, limit: number = 30): Promise<PGListing[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pg_listings")
    .select("*")
    .eq("city", city)
    .order("rating", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []).map(toCamelCase);
}

export async function getListingsByArea(area: string, limit: number = 30): Promise<PGListing[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("pg_listings")
    .select("*")
    .ilike("area", area)
    .order("rating", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []).map(toCamelCase);
}
