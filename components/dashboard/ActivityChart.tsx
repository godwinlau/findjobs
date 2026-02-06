"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui";
import type { DailyActivity } from "@/lib/actions/dashboard-stats";

interface ActivityChartProps {
  data: DailyActivity[];
  animationDelay?: number;
}

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "#F5F5F0",
        border: "2px solid #0A0A0A",
        padding: "8px 12px",
        boxShadow: "4px 4px 0 #0A0A0A",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          textTransform: "uppercase" as const,
          letterSpacing: "0.04em",
          color: "#888",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {payload.map((entry, index) => (
        <div
          key={index}
          style={{
            fontSize: 11,
            color: entry.color,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              background: entry.color,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase" as const,
              color: "#888",
            }}
          >
            {entry.name}:
          </span>
          <span style={{ fontWeight: 700, color: "#0A0A0A" }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ActivityChart({ data, animationDelay = 0 }: ActivityChartProps) {
  const hasData = data.some((d) => d.applications > 0 || d.views > 0);
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.applications, d.views)),
    4
  );

  return (
    <Card
      style={{
        padding: "20px 20px 12px 12px",
        marginBottom: 20,
      }}
      animationDelay={animationDelay}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          textTransform: "uppercase" as const,
          letterSpacing: "0.06em",
          color: "#888",
          marginBottom: 16,
          paddingLeft: 8,
        }}
      >
        Weekly Activity
      </div>

      {!hasData ? (
        <div
          style={{
            height: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#888",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase" as const,
          }}
        >
          No activity this week yet. Start browsing jobs!
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(10,10,10,0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "#888", fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={{ stroke: "#0A0A0A", strokeWidth: 2 }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#888", fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={false}
              domain={[0, maxValue]}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                paddingTop: 8,
              }}
              iconType="rect"
              iconSize={8}
            />
            <Line
              type="monotone"
              dataKey="applications"
              name="Applications"
              stroke="#FBBF24"
              strokeWidth={2}
              dot={{ fill: "#FBBF24", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, stroke: "#0A0A0A", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="views"
              name="Views"
              stroke="#888"
              strokeWidth={2}
              dot={{ fill: "#888", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, stroke: "#0A0A0A", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
