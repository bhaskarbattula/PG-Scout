"use client";

import { X } from "lucide-react";
import type { SearchFilters } from "@/types";

interface FilterSidebarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onClose?: () => void;
  show?: boolean;
}

export function FilterSidebar({ filters, onChange, onClose, show }: FilterSidebarProps) {
  const amenities: { key: keyof SearchFilters; label: string }[] = [
    { key: "wifi", label: "WiFi" },
    { key: "foodAvailable", label: "Food" },
    { key: "ac", label: "AC" },
    { key: "laundry", label: "Laundry" },
    { key: "parking", label: "Parking" },
    { key: "furnished", label: "Furnished" },
  ];

  const setFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const sidebar = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Filters</h3>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Gender
        </label>
        <div className="flex gap-2">
          {[
            { value: "", label: "All" },
            { value: "boys", label: "Boys" },
            { value: "girls", label: "Girls" },
            { value: "unisex", label: "Unisex" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter("gender", opt.value as SearchFilters["gender"])}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border"
              style={{
                backgroundColor: filters.gender === opt.value ? "var(--primary)" : "transparent",
                borderColor: filters.gender === opt.value ? "var(--primary)" : "var(--border)",
                color: filters.gender === opt.value ? "#fff" : "var(--text-primary)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Type
        </label>
        <div className="flex gap-2">
          {[
            { value: "", label: "All" },
            { value: "pg", label: "PG" },
            { value: "hostel", label: "Hostel" },
            { value: "dorm", label: "Dorm" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter("type", opt.value as SearchFilters["type"])}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border"
              style={{
                backgroundColor: filters.type === opt.value ? "var(--primary)" : "transparent",
                borderColor: filters.type === opt.value ? "var(--primary)" : "var(--border)",
                color: filters.type === opt.value ? "#fff" : "var(--text-primary)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Rent Range
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.rentMin || ""}
            onChange={(e) => setFilter("rentMin", e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 rounded-lg text-xs border outline-none transition-all"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.rentMax || ""}
            onChange={(e) => setFilter("rentMax", e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 rounded-lg text-xs border outline-none transition-all"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Amenities
        </label>
        <div className="grid grid-cols-2 gap-2">
          {amenities.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key, !filters[key])}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border"
              style={{
                backgroundColor: filters[key] ? "rgba(6, 214, 160, 0.1)" : "transparent",
                borderColor: filters[key] ? "var(--accent)" : "var(--border)",
                color: filters[key] ? "var(--accent)" : "var(--text-primary)",
              }}
            >
              <div
                className="w-3.5 h-3.5 rounded border flex items-center justify-center transition-all"
                style={{
                  borderColor: filters[key] ? "var(--accent)" : "var(--border)",
                  backgroundColor: filters[key] ? "var(--accent)" : "transparent",
                }}
              >
                {filters[key] && <span className="text-white text-[8px]">&#10003;</span>}
              </div>
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() =>
          onChange({
            gender: "",
            type: "",
            rentMin: undefined,
            rentMax: undefined,
            wifi: undefined,
            foodAvailable: undefined,
            ac: undefined,
            laundry: undefined,
            parking: undefined,
            furnished: undefined,
          })
        }
        className="w-full py-2 rounded-lg text-xs font-medium border transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
        style={{
          borderColor: "var(--border)",
          color: "var(--text-secondary)",
        }}
      >
        Clear All Filters
      </button>
    </div>
  );

  if (show !== undefined) {
    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          style={{ display: show ? "block" : "none" }}
          onClick={onClose}
        />
        <div
          className="fixed top-0 right-0 bottom-0 z-50 w-72 p-6 overflow-y-auto shadow-xl md:hidden"
          style={{
            backgroundColor: "var(--card-bg)",
            transform: show ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.2s ease",
          }}
        >
          {sidebar}
        </div>
      </>
    );
  }

  return <div className="hidden md:block">{sidebar}</div>;
}
