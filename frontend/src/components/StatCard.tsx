import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { AnimatedNumber } from "@/components/AnimatedNumber";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "emerald",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "emerald" | "slate";
}) {
  const iconWrap =
    accent === "emerald"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-slate-100 text-slate-600";

  return (
    <Card className="p-6 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconWrap}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </h2>
    </Card>
  );
}
