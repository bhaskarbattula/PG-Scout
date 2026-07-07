import { CompanySearch } from "@/components/CompanySearch";
import { TrendingPGs } from "@/components/TrendingPGs";

export default function HomePage() {
  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--bg) 0%, rgba(255, 107, 53, 0.05) 50%, rgba(6, 214, 160, 0.05) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              Find PG Near <span className="text-[var(--primary)]">Your Hyderabad Workplace</span>
            </h1>
            <p className="text-lg md:text-xl mb-8" style={{ color: "var(--text-secondary)" }}>
              Search by company name or office location. Find PGs near Amazon, Google, Microsoft, TCS, Infosys, and 50+ companies in Hyderabad&rsquo;s IT corridor.
            </p>
            <CompanySearch className="max-w-2xl mx-auto" />
            <p className="text-sm mt-4" style={{ color: "var(--text-secondary)" }}>
              Try: &ldquo;Amazon Hitech City&rdquo; &bull; &ldquo;TCS Gachibowli&rdquo; &bull; &ldquo;Financial District&rdquo;
            </p>
          </div>
        </div>
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: "var(--primary)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10"
          style={{ backgroundColor: "var(--accent)" }}
        />
      </section>

      <TrendingPGs />

      <section
        className="py-16"
        style={{ backgroundColor: "rgba(255, 107, 53, 0.03)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                step: "1",
                title: "Enter Your Company",
                desc: "Type your company name. We'll find the Hyderabad office locations.",
              },
              {
                step: "2",
                title: "Select Your Office",
                desc: "Pick your specific office branch in Hyderabad. We search for PGs nearby.",
              },
              {
                step: "3",
                title: "Find Your PG",
                desc: "Browse PGs near your Hyderabad workplace. Filter by budget and amenities.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {step}
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {title}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
