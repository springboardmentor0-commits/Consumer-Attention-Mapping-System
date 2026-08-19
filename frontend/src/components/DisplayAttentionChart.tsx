"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { AccentIcon } from "@/components/ui/AccentIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  CHART_COLORS,
  CHART_INK,
  axisTick,
  tooltipCursor,
  tooltipStyle,
} from "@/lib/chartTheme";

export function DisplayAttentionChart({
  shelfAViews,
  shelfBViews,
}: {
  shelfAViews: number;
  shelfBViews: number;
}) {
  const data = [
    { name: "Shelf A", views: shelfAViews, fill: CHART_COLORS.analytics },
    { name: "Shelf B", views: shelfBViews, fill: CHART_COLORS.behavior },
  ];

  const total = shelfAViews + shelfBViews;

  return (
    <Card className="animate-fade-in p-6">
      <CardHeader
        icon={<AccentIcon icon={BarChart3} variant="analytics" />}
        title="Shelf Attention"
        description="Recorded gaze events per shelf zone."
        action={
          <StatusBadge variant={total > 0 ? "analytics" : "neutral"}>
            {total} {total === 1 ? "view" : "views"}
          </StatusBadge>
        }
      />

      {/* Legend sits above the plot so the series colours are readable even
          when a bar is zero-height. */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {data.map((series) => (
          <span
            key={series.name}
            className="inline-flex items-center gap-2 text-xs font-medium text-ink-muted"
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ background: series.fill }}
            />
            {series.name}
          </span>
        ))}
      </div>

      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_INK.grid}
              vertical={false}
            />

            <XAxis
              dataKey="name"
              tick={axisTick}
              tickLine={false}
              axisLine={{ stroke: CHART_INK.axis }}
            />

            <YAxis
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              width={44}
              allowDecimals={false}
            />

            <Tooltip
              cursor={tooltipCursor}
              contentStyle={tooltipStyle}
            />

            <Bar
              dataKey="views"
              name="Views"
              fill={CHART_COLORS.analytics}
              radius={[8, 8, 0, 0]}
              maxBarSize={96}
              isAnimationActive={false}
            >
              {data.map((series) => (
                <Cell key={series.name} fill={series.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
