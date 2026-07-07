import type { ApiResponse, Branch, ChatResponse, Company, PGListing, SearchResponse } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `Request failed: ${res.status}`);
    }

    const json: ApiResponse<T> = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  }

  async search(params: {
    query?: string;
    branchId?: string;
    gender?: string;
    minRent?: number;
    maxRent?: number;
    lat?: number;
    lng?: number;
    radius?: number;
    page?: number;
    size?: number;
  }): Promise<SearchResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    });
    return this.request<SearchResponse>(`/api/search?${searchParams.toString()}`);
  }

  async getCompanies(): Promise<Company[]> {
    return this.request<Company[]>("/api/companies");
  }

  async searchCompanies(q: string): Promise<Company[]> {
    return this.request<Company[]>(`/api/companies/search?q=${encodeURIComponent(q)}`);
  }

  async getCompany(id: string): Promise<Company> {
    return this.request<Company>(`/api/companies/${id}`);
  }

  async getBranches(companyId: string, city?: string): Promise<Branch[]> {
    const params = city ? `?city=${encodeURIComponent(city)}` : "";
    return this.request<Branch[]>(`/api/companies/${companyId}/branches${params}`);
  }

  async getPG(slug: string): Promise<PGListing> {
    return this.request<PGListing>(`/api/pgs/${slug}`);
  }

  async getTrendingPGs(): Promise<PGListing[]> {
    return this.request<PGListing[]>("/api/pgs/trending");
  }

  async chat(message: string, branchId?: string, sessionId?: string): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, branchId, sessionId }),
    });
  }

  async getChatSuggestions(): Promise<string[]> {
    return this.request<string[]>("/api/chat/suggestions");
  }

  async searchAreas(q: string): Promise<string[]> {
    return this.request<string[]>(`/api/pgs/areas?q=${encodeURIComponent(q)}`);
  }

  async health(): Promise<Record<string, string>> {
    return this.request<Record<string, string>>("/api/health");
  }
}

export const api = new ApiClient(API_BASE);
