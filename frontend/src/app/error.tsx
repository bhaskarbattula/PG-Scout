"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md px-4">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Something went wrong
        </h1>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
