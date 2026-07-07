"use client";

import { motion } from "framer-motion";
import { MapPin, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Branch } from "@/types";

interface BranchSelectorProps {
  companyName: string;
  branches: Branch[];
  onSelect: (branch: Branch) => void;
}

export function BranchSelector({ companyName, branches, onSelect }: BranchSelectorProps) {
  if (!branches || branches.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(255, 107, 53, 0.1)" }}>
              <Building2 className="w-5 h-5" style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <h3 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                {companyName}
              </h3>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Select an office location
              </p>
            </div>
          </div>

          <motion.div className="space-y-2">
            {branches.map((branch, index) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => onSelect(branch)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(6, 214, 160, 0.1)" }}>
                    <MapPin className="w-4 h-4" style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {branch.name || companyName}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {branch.cityName}{branch.address ? ` – ${branch.address}` : ""}
                    </p>
                  </div>
                  <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 shrink-0">
                    View PGs
                  </span>
                </button>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
