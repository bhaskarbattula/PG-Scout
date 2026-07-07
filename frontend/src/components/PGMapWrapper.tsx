"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const PGMapComponent = dynamic(() => import("@/components/PGMap").then((m) => m.PGMap), {
  ssr: false,
});

type PGMapProps = ComponentProps<typeof PGMapComponent>;

export function PGMapWrapper(props: PGMapProps) {
  return <PGMapComponent {...props} />;
}
