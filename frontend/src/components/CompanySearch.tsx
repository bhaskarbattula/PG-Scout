"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, MapPin, Loader2, Map } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCompanySearch } from "@/hooks/useSearch";
import { useBranches } from "@/hooks/useSearch";
import { api } from "@/lib/api/client";
import type { Company, Branch } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface CompanySearchProps {
  className?: string;
  onBranchSelect?: (branch: Branch) => void;
}

export function CompanySearch({ className = "", onBranchSelect }: CompanySearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pendingBranchRedirect = useRef(false);

  const { data: companies, isLoading: loadingCompanies } = useCompanySearch(debouncedQuery);
  const { data: branches } = useBranches(selectedCompany?.id ?? null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Area search — runs alongside company search
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setAreas([]);
      return;
    }
    let cancelled = false;
    setLoadingAreas(true);
    api.searchAreas(debouncedQuery)
      .then((result) => { if (!cancelled) setAreas(result); })
      .catch(() => { if (!cancelled) setAreas([]); })
      .finally(() => { if (!cancelled) setLoadingAreas(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Once branches data arrives after a company is selected, handle redirect or keep open
  useEffect(() => {
    if (!selectedCompany || !branches) return;
    if (pendingBranchRedirect.current) return;
    pendingBranchRedirect.current = true;

    if (branches.length === 1) {
      router.push(`/search?branchId=${branches[0].id}`);
      if (onBranchSelect) onBranchSelect(branches[0]);
      setShowSuggestions(false);
    }
  }, [branches, selectedCompany, router, onBranchSelect]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    },
    [query, router]
  );

  const handleCompanySelect = useCallback(
    (company: Company) => {
      pendingBranchRedirect.current = false;
      setSelectedCompany(company);
      setQuery(company.name);
      setShowSuggestions(true);
    },
    []
  );

  const handleAreaSelect = useCallback(
    (area: string) => {
      router.push(`/search?query=${encodeURIComponent(area)}`);
      setShowSuggestions(false);
      setQuery(area);
    },
    [router]
  );

  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        router.push(`/search?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
      },
      () => {}
    );
  }, [router]);

  const hasCompanies = companies && companies.length > 0;
  const hasAreas = areas.length > 0;
  const showDropdown = showSuggestions && (hasCompanies || !!selectedCompany || hasAreas || loadingCompanies || loadingAreas);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5" style={{ color: "var(--text-secondary)" }} />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setSelectedCompany(null);
            }}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            placeholder='Try "Amazon Hyderabad", "TCS Gachibowli", or "Hitech City"...'
            className="w-full pl-12 pr-24 h-12 text-base rounded-xl"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={handleDetectLocation}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Use my location"
            >
              <MapPin className="w-4 h-4" style={{ color: "var(--primary)" }} />
            </button>
            <Button type="submit" size="sm">
              Search
            </Button>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] shadow-lg overflow-hidden z-50"
          >
            {(loadingCompanies || loadingAreas) && (
              <div className="flex items-center gap-2 px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--text-secondary)" }} />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Searching...</span>
              </div>
            )}

            {!loadingCompanies && selectedCompany && branches && (
              <div className="p-3">
                <p className="text-xs font-medium px-2 mb-2" style={{ color: "var(--text-secondary)" }}>
                  Branches for {selectedCompany.name}
                </p>
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("Branch clicked:", b.id, b.name);
                      window.location.href = `/search?branchId=${b.id}`;
                      if (onBranchSelect) onBranchSelect(b);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--accent)]/10">
                      <MapPin className="w-4 h-4" style={{ color: "var(--accent)" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {b.name || selectedCompany.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {b.cityName}{b.address ? ` - ${b.address}` : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!selectedCompany && hasCompanies && (
              <div className="p-3">
                <p className="text-xs font-medium px-2 mb-2" style={{ color: "var(--text-secondary)" }}>
                  Companies
                </p>
                {companies!.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCompanySelect(c)}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--primary)]/10">
                      <Building2 className="w-4 h-4" style={{ color: "var(--primary)" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {c.name}
                      </p>
                      {c.description && (
                        <p className="text-xs line-clamp-1" style={{ color: "var(--text-secondary)" }}>
                          {c.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!selectedCompany && !hasCompanies && hasAreas && (
              <div className="p-3">
                <p className="text-xs font-medium px-2 mb-2" style={{ color: "var(--text-secondary)" }}>
                  Areas in Hyderabad
                </p>
                {areas.map((area) => (
                  <button
                    key={area}
                    onClick={() => handleAreaSelect(area)}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--accent)]/10">
                      <Map className="w-4 h-4" style={{ color: "var(--accent)" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {area}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        Area in Hyderabad
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
