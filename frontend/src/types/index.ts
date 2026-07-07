export type PGType = "pg" | "hostel" | "dorm";
export type Gender = "boys" | "girls" | "unisex";

export interface City {
  id: string;
  name: string;
  state: string;
  slug: string;
  image_url: string | null;
}

export interface Company {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  wikidataId: string | null;
  abbreviation: string | null;
}

export interface Branch {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  cityId: string;
  cityName: string;
  address: string | null;
  latitude: number;
  longitude: number;
}

export interface PGListing {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string;
  area: string | null;
  type: PGType;
  gender: Gender;
  rentMin: number;
  rentMax: number | null;
  foodAvailable: boolean;
  wifi: boolean;
  laundry: boolean;
  parking: boolean;
  ac: boolean;
  furnished: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  phone: string | null;
  distance: number | null;
}

export interface SearchFilters {
  gender?: Gender | "";
  type?: PGType | "";
  rentMin?: number;
  rentMax?: number;
  foodAvailable?: boolean;
  wifi?: boolean;
  laundry?: boolean;
  parking?: boolean;
  ac?: boolean;
  furnished?: boolean;
}

export interface SearchResponse {
  query: string | null;
  type: "multiple_branches" | "results" | string;
  company: Company | null;
  branches: Branch[];
  selectedBranch: Branch | null;
  pgListings: PGListing[];
  totalCount: number;
}

export interface ChatResponse {
  message: string;
  suggestions: string[];
  branches: Branch[];
  pgListings: PGListing[];
  action: "text" | "select_branch" | "show_pgs" | string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  pagination?: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}
