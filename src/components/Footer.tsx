import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)]" style={{ background: "var(--card-bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                PG<span className="text-[var(--primary)]">Finder</span>
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              India's simplest PG and hostel search engine. Find your perfect home near you.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Top Cities</h3>
            <ul className="space-y-2">
              {["Hyderabad", "Bengaluru", "Mumbai", "Pune", "Delhi", "Chennai"].map((city) => (
                <li key={city}>
                  <Link
                    href={`/city/${city.toLowerCase()}`}
                    className="text-sm transition-colors hover:text-[var(--primary)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Popular Areas</h3>
            <ul className="space-y-2">
              {["Gachibowli", "Koramangala", "Whitefield", "Andheri", "Hinjewadi", "Powai"].map((area) => (
                <li key={area}>
                  <Link
                    href={`/area/${area.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm transition-colors hover:text-[var(--primary)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {area}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>PG Types</h3>
            <ul className="space-y-2">
              {[
                { label: "Boys PG", gender: "boys" },
                { label: "Girls PG", gender: "girls" },
                { label: "Unisex PG", gender: "unisex" },
                { label: "Hostels", type: "hostel" },
                { label: "Dorms", type: "dorm" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={`/search?${item.gender ? `gender=${item.gender}` : `type=${item.type}`}`}
                    className="text-sm transition-colors hover:text-[var(--primary)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[var(--border)] text-center">
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            &copy; {new Date().getFullYear()} PG Finder. Built with simplicity in mind.
          </p>
        </div>
      </div>
    </footer>
  );
}
