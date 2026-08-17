import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { tone } from "@/lib/tone";

/**
 * Direction-of-travel marker for a metric.
 *
 * `direction` is passed in rather than inferred from the sign, because for
 * some metrics a fall is the good outcome. `label` describes the comparison
 * period ("vs last run") and is optional.
 */
export function TrendIndicator({
  direction,
  value,
  label,
  intent = "positive-up",
  className,
}: {
  direction: "up" | "down" | "flat";
  value: string;
  label?: string;
  /** Which direction should read as healthy. */
  intent?: "positive-up" | "positive-down";
  className?: string;
}) {
  const Icon =
    direction === "up"
      ? ArrowUpRight
      : direction === "down"
        ? ArrowDownRight
        : Minus;

  const good =
    intent === "positive-up" ? direction === "up" : direction === "down";

  const variant =
    direction === "flat" ? "neutral" : good ? "healthy" : "critical";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        tone(variant).text,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {value}
      {label && (
        <span className="font-normal text-ink-subtle">{label}</span>
      )}
    </span>
  );
}
