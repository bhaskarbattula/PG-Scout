"use client";

import { Search, MapPin, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface Suggestion {
  type: "city" | "area";
  label: string;
  slug: string;
  city?: string;
}

export function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const supabase = createClient();

    try {
      const [cityRes, areaRes] = await Promise.all([
        supabase
          .from("cities")
          .select("name, slug")
          .ilike("name", `%${q}%`)
          .limit(5),
        supabase
          .from("areas")
          .select("name, slug, cities!inner(name)")
          .ilike("name", `%${q}%`)
          .limit(5),
      ]);

      const citySuggestions: Suggestion[] = (cityRes.data || []).map((c) => ({
        type: "city" as const,
        label: c.name,
        slug: c.slug,
      }));

      const areaSuggestions: Suggestion[] = (areaRes.data || []).map((a) => ({
        type: "area" as const,
        label: a.name,
        slug: a.slug,
        city: (a as unknown as { cities: { name: string } }).cities.name,
      }));

      setSuggestions([...citySuggestions, ...areaSuggestions]);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?query=${encodeURIComponent(query.trim())}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (s: Suggestion) => {
    setShowSuggestions(false);
    setQuery("");
    if (s.type === "city") {
      router.push(`/city/${s.slug}`);
    } else {
      router.push(`/area/${s.slug}`);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        router.push(
          `/search?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`
        );
      },
      () => {}
    );
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search
            className="absolute left-4 w-5 h-5"
            style={{ color: "var(--text-secondary)" }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              fetchSuggestions(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            placeholder="Search by city, area, or PG name..."
            className="w-full pl-12 pr-24 py-3.5 rounded-xl border-2 transition-all outline-none text-sm"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            onFocusCapture={(e) => {
              (e.target as HTMLInputElement).style.borderColor = "var(--primary)";
            }}
            onBlurCapture={(e) => {
              (e.target as HTMLInputElement).style.borderColor = "var(--border)";
            }}
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={handleDetectLocation}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Use my location"
            >
              <MapPin className="w-4 h-4" style={{ color: "var(--primary)" }} />
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-lg overflow-hidden z-50"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border)",
          }}
        >
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--text-secondary)" }} />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Searching...</span>
            </div>
          )}
          {!loading && suggestions.map((s, i) => (
            <button
              key={`${s.type}-${s.slug}-${i}`}
              onClick={() => handleSuggestionClick(s)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: s.type === "city"
                    ? "rgba(255, 107, 53, 0.1)"
                    : "rgba(6, 214, 160, 0.1)",
                  color: s.type === "city" ? "var(--primary)" : "var(--accent)",
                }}
              >
                {s.type === "city" ? "C" : "A"}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {s.label}
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {s.type === "city" ? "City" : `Area${s.city ? ` in ${s.city}` : ""}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
