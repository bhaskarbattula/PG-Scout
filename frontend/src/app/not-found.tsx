import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4" style={{ color: "var(--primary)" }}>
          404
        </h1>
        <p className="text-xl font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Page not found
        </p>
        <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
