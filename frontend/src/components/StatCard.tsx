import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { AccentIcon } from "@/components/ui/AccentIcon";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import type { Tone } from "@/lib/tone";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "analytics",
  hint,
  trend,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** Semantic tone for the icon chip — see src/lib/tone.ts. */
  accent?: Tone;
  /** Short qualifier under the value, e.g. "across 3 stores". */
  hint?: string;
  /** Usually a <TrendIndicator />. */
  trend?: ReactNode;
}) {
  return (
    <Card className="animate-fade-in p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-muted">{label}</p>

        <AccentIcon icon={Icon} variant={accent} />
      </div>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-ink tabular-nums">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </p>

      {(hint || trend) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          {trend}
          {hint && <span className="text-xs text-ink-subtle">{hint}</span>}
        </div>
      )}
    </Card>
  );
}
