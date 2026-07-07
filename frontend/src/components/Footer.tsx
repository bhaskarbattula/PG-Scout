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
            <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: "All Hyderabad PGs", href: "/search?query=Hyderabad" },
                { label: "Hitech City PGs", href: "/area/hitech-city" },
                { label: "Gachibowli PGs", href: "/area/gachibowli" },
                { label: "Kondapur PGs", href: "/area/kondapur" },
                { label: "Madhapur PGs", href: "/area/madhapur" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-[var(--primary)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {link.label}
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
