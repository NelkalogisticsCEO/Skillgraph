import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RankTier } from "@/data/mockUsers";

const TIER_STYLES: Record<RankTier, string> = {
  Bronze: "from-amber-700 to-amber-500 text-amber-50",
  Silver: "from-slate-400 to-slate-200 text-slate-900",
  Gold: "from-yellow-500 to-amber-300 text-amber-950",
  Elite: "from-primary to-primary-glow text-primary-foreground",
};

interface Props {
  tier: RankTier;
  size?: "sm" | "md";
  className?: string;
}

export const RankBadge = ({ tier, size = "md", className }: Props) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full font-semibold bg-gradient-to-r shadow-sm",
      TIER_STYLES[tier],
      size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
      className
    )}
  >
    <Trophy className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
    {tier}
  </span>
);
