"use client";

import Link from "next/link";
import { useTheme } from "@/providers/ThemeProvider";
import { Moon, Sun, Search, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>
              PG<span className="text-[var(--primary)]">Finder</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/search"
              className="text-sm font-medium transition-colors hover:text-[var(--primary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Search
            </Link>
            <Link
              href="/city/hyderabad"
              className="text-sm font-medium transition-colors hover:text-[var(--primary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Hyderabad
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[var(--dark-highlight)]" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
            ) : (
              <Menu className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] glass">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/search"
              className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: "var(--text-primary)" }}
              onClick={() => setMobileOpen(false)}
            >
              Search
            </Link>
            <Link
              href="/city/hyderabad"
              className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: "var(--text-primary)" }}
              onClick={() => setMobileOpen(false)}
            >
              Hyderabad
            </Link>

            <button
              onClick={() => { toggleTheme(); setMobileOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: "var(--text-primary)" }}
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
