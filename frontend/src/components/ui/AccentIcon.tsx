import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { tone, type Tone } from "@/lib/tone";

const SIZES = {
  sm: { box: "h-8 w-8 rounded-lg", glyph: "h-4 w-4" },
  md: { box: "h-9 w-9 rounded-lg", glyph: "h-[18px] w-[18px]" },
  lg: { box: "h-10 w-10 rounded-xl", glyph: "h-5 w-5" },
} as const;

/** A lucide icon on a tinted square, tinted by semantic tone. */
export function AccentIcon({
  icon: Icon,
  variant = "neutral",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  variant?: Tone;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const dimensions = SIZES[size];

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center",
        dimensions.box,
        tone(variant).icon,
        className
      )}
    >
      <Icon className={dimensions.glyph} />
    </span>
  );
}
