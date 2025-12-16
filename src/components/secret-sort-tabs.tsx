"use client";

import { motion } from "framer-motion";
import { ArrowDownAZ, Flame, TrendingUp } from "lucide-react";

export type SortOption = "newest" | "spiciest" | "popular";

interface SecretSortTabsProps {
  activeSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: {
  value: SortOption;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "newest",
    label: "Newest",
    icon: <ArrowDownAZ className="w-4 h-4" />,
  },
  { value: "spiciest", label: "Spiciest", icon: <Flame className="w-4 h-4" /> },
  {
    value: "popular",
    label: "Popular",
    icon: <TrendingUp className="w-4 h-4" />,
  },
];

export function SecretSortTabs({
  activeSort,
  onSortChange,
}: SecretSortTabsProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      <span className="text-sm text-muted-foreground mr-2">Sort by:</span>
      <div className="inline-flex art-deco-border bg-card/50 backdrop-blur-sm p-1 rounded-lg">
        {sortOptions.map((option) => {
          const isActive = activeSort === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`
                relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                flex items-center gap-2
                ${
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-md art-deco-glow"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {option.icon}
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
