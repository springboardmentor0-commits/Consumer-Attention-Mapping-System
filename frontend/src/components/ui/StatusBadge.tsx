import { cn } from "@/lib/utils";
import { tone, type Tone } from "@/lib/tone";

/**
 * Small status pill — priority, score band, live/offline state.
 * `dot` adds a leading indicator for states rather than classifications.
 */
export function StatusBadge({
  children,
  variant = "neutral",
  dot = false,
  className,
}: {
  children: React.ReactNode;
  variant?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1",
        "text-xs font-medium",
        tone(variant).badge,
        className
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn("h-1.5 w-1.5 rounded-full", tone(variant).bar)}
        />
      )}
      {children}
    </span>
  );
}
