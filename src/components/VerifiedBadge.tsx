import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const VerifiedBadge = ({
  className,
  label = "LinkedIn Verified",
}: { className?: string; label?: string }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary ring-1 ring-primary/30",
      className
    )}
    title={label}
  >
    <BadgeCheck className="h-3 w-3" />
    {label}
  </span>
);
