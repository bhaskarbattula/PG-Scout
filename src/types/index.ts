export type PGType = "pg" | "hostel" | "dorm";
export type Gender = "boys" | "girls" | "unisex";
export type Source = "osm" | "scrape" | "manual";

export interface PGListing {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  address: string | null;
  city: string;
  area: string | null;
  type: PGType;
  gender: Gender;
  rent_min: number;
  rent_max: number | null;
  food_available: boolean;
  wifi: boolean;
  laundry: boolean;
  parking: boolean;
  ac: boolean;
  furnished: boolean;
  rating: number;
  review_count: number;
  images: string[];
  phone: string | null;
  source: Source;
  last_updated: string;
  created_at: string;
}

export interface City {
  id: string;
  name: string;
  state: string;
  slug: string;
  image_url: string | null;
  created_at: string;
}

export interface Area {
  id: string;
  name: string;
  slug: string;
  city_id: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface SearchFilters {
  query?: string;
  city?: string;
  area?: string;
  gender?: Gender | "";
  type?: PGType | "";
  rentMin?: number;
  rentMax?: number;
  food_available?: boolean;
  wifi?: boolean;
  laundry?: boolean;
  parking?: boolean;
  ac?: boolean;
  furnished?: boolean;
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  listings: PGListing[];
  total: number;
  page: number;
  pageSize: number;
}
