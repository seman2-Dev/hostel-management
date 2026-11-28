"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/** Brand-neutral, colour-blind-friendly palette that reads on both light and dark surfaces. */
export const CHART_COLORS = ["#0f8f6f", "#e0a526", "#3b82f6", "#e5484d", "#8b5cf6", "#64748b"];

const tick = { fill: "hsl(var(--muted-foreground))", fontSize: 12 };
const tooltipStyle: React.CSSProperties = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 10,
  color: "hsl(var(--popover-foreground))",
  fontSize: 13,
};

export type ChartRow = Record<string, string | number>;
export interface SeriesDef {
  key: string;
  label: string;
  color?: string;
}

interface BaseProps {
  data: ChartRow[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  ariaLabel: string;
  formatX?: (v: string | number) => string;
  formatY?: (v: number) => string;
}

function Frame({ height, ariaLabel, children }: { height: number; ariaLabel: string; children: React.ReactElement }) {
  return (
    <div role="img" aria-label={ariaLabel} style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function BarSeriesChart({ data, xKey, series, height = 260, ariaLabel, formatX, formatY, stacked }: BaseProps & { stacked?: boolean }) {
  return (
    <Frame height={height} ariaLabel={ariaLabel}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={tick} tickLine={false} axisLine={false} tickFormatter={formatX} interval="preserveStartEnd" />
        <YAxis tick={tick} tickLine={false} axisLine={false} width={48} tickFormatter={formatY} allowDecimals={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "hsl(var(--muted) / 0.6)" }}
          labelFormatter={formatX}
          formatter={(v: number, name: string) => [formatY ? formatY(v) : v, name]}
        />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            radius={stacked ? 0 : [4, 4, 0, 0]}
            stackId={stacked ? "a" : undefined}
            maxBarSize={36}
          />
        ))}
      </BarChart>
    </Frame>
  );
}

export function LineSeriesChart({ data, xKey, series, height = 260, ariaLabel, formatX, formatY }: BaseProps) {
  return (
    <Frame height={height} ariaLabel={ariaLabel}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={tick} tickLine={false} axisLine={false} tickFormatter={formatX} interval="preserveStartEnd" />
        <YAxis tick={tick} tickLine={false} axisLine={false} width={48} tickFormatter={formatY} domain={["auto", "auto"]} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={formatX}
          formatter={(v: number, name: string) => [formatY ? formatY(v) : v, name]}
        />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </Frame>
  );
}

export function DonutChart({
  data,
  height = 240,
  ariaLabel,
  formatValue,
}: {
  data: Array<{ name: string; value: number }>;
  height?: number;
  ariaLabel: string;
  formatValue?: (v: number) => string;
}) {
  return (
    <Frame height={height} ariaLabel={ariaLabel}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2} stroke="hsl(var(--card))">
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [formatValue ? formatValue(v) : v, name]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </Frame>
  );
}
