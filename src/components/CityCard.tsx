import Link from "next/link";
import type { City } from "@/types";

interface CityCardProps {
  city: City;
}

export function CityCard({ city }: CityCardProps) {
  return (
    <Link href={`/city/${city.slug}`}>
      <div
        className="relative rounded-xl overflow-hidden card-shadow transition-all duration-200 hover:card-shadow-lg hover:-translate-y-0.5 group"
        style={{ backgroundColor: "var(--card-bg)" }}
      >
        <div className="relative h-40">
          <img
            src={city.image_url || "/placeholder-city.svg"}
            alt={city.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold text-lg">{city.name}</h3>
            <p className="text-white/80 text-sm">{city.state}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
