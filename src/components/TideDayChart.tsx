"use client";
import { useEffect, useState, useId } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceArea,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TideDay } from "@/lib/types";
import { dayBounds, formatClock, chartSeries } from "@/lib/time";
const colors: Record<string, string> = {
  beach: "var(--color-seaglass-200)",
  shelling: "var(--color-sand-300)",
  kayaking: "var(--color-ocean-200)",
  fishing: "var(--color-coral-200)",
  gathering: "var(--color-sand-400)",
  "nature-walk": "var(--color-seaglass-300)",
};
export default function TideDayChart({
  day,
  timeZone,
  units,
  intervalMinutes,
}: {
  day: TideDay;
  timeZone: string;
  units: "ft" | "m";
  intervalMinutes: number;
}) {
  const [now, setNow] = useState<number | null>(null),
    id = useId().replaceAll(":", ""),
    [start, end] = dayBounds(day.date, timeZone);
  useEffect(() => {
    const update = () => setNow(Date.now()),
      initial = setTimeout(update, 0),
      timer = setInterval(update, 30000);
    document.addEventListener("visibilitychange", update);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  const heights = [...day.curve, ...day.highLow].map((p) => p.height),
    low = Math.min(0, ...heights),
    high = Math.max(1, ...heights),
    pad = (high - low) * 0.1;
  const ticks = Array.from(
    { length: 7 },
    (_, i) => start + ((end - start) * i) / 6,
  );
  const series = chartSeries(day.curve, intervalMinutes * 60000);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-sand-100 p-3 md:p-6">
      <p className="text-sm text-drift-400 mb-3">
        {day.curve.length
          ? "Height curve and planning windows"
          : "No height curve available. High/low times and planning windows are still shown."}
      </p>
      <div
        aria-label={`Tide chart for ${day.date}; times in ${timeZone}`}
        role="img"
      >
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={series}
            margin={{ top: 20, right: 15, left: 0, bottom: 25 }}
          >
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-ocean-300)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-ocean-300)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={[start, end]}
              allowDataOverflow
              ticks={ticks}
              tickFormatter={(v) => formatClock(v, timeZone)}
              tick={{ fontSize: 10, fill: "var(--color-drift-400)" }}
              angle={-20}
              textAnchor="end"
              minTickGap={25}
            />
            <YAxis
              domain={[low - pad, high + pad]}
              tickFormatter={(v) => `${Number(v.toFixed(1))}${units}`}
              tick={{ fontSize: 11, fill: "var(--color-drift-400)" }}
              width={45}
            />
            {day.activities.map((a) => (
              <ReferenceArea
                key={`${a.id}:${a.startTimestamp}`}
                x1={a.startTimestamp}
                x2={a.endTimestamp}
                fill={colors[a.activity] || "var(--color-sand-200)"}
                fillOpacity={0.22}
                strokeOpacity={0}
              />
            ))}
            {day.sunrise !== undefined && (
              <ReferenceLine
                x={day.sunrise}
                stroke="var(--color-sand-500)"
                strokeDasharray="4 4"
                label={{ value: "Sunrise", position: "top", fontSize: 10 }}
              />
            )}
            {day.sunset !== undefined && (
              <ReferenceLine
                x={day.sunset}
                stroke="var(--color-coral-500)"
                strokeDasharray="4 4"
                label={{ value: "Sunset", position: "top", fontSize: 10 }}
              />
            )}
            {now !== null && now >= start && now < end && (
              <ReferenceLine
                x={now}
                stroke="var(--color-seaglass-500)"
                strokeWidth={2}
                label={{ value: "Now", position: "top", fontSize: 11 }}
              />
            )}
            {day.highLow.map((p) => (
              <ReferenceLine
                key={p.timestamp}
                x={p.timestamp}
                stroke="var(--color-ocean-400)"
                strokeDasharray="2 4"
              />
            ))}
            <Tooltip
              labelFormatter={(label) => formatClock(Number(label), timeZone)}
              formatter={(value) => [
                `${Number(value).toFixed(2)} ${units}`,
                "Height",
              ]}
            />
            <Area
              type="linear"
              dataKey="height"
              stroke="var(--color-ocean-400)"
              strokeWidth={2}
              fill={`url(#${id})`}
              connectNulls={false}
              dot={day.curve.length === 1 ? { r: 4 } : false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-drift-400">
        {[...new Set(day.activities.map((a) => a.activity))].map((a) => (
          <span key={a} className="flex items-center gap-1">
            <span
              className="w-3 h-2 rounded-sm inline-block"
              style={{ background: colors[a] || "var(--color-sand-200)" }}
            />
            {a.replaceAll("-", " ")}
          </span>
        ))}
      </div>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-ocean-400 underline">
          Read curve values as a table
        </summary>
        {day.curve.length ? (
          <div className="max-h-64 overflow-auto mt-3">
            <table className="w-full text-left">
              <caption className="text-left mb-2">
                {day.date}, {timeZone}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Height ({units})</th>
                </tr>
              </thead>
              <tbody>
                {day.curve.map((p) => (
                  <tr key={p.timestamp}>
                    <td>{formatClock(p.timestamp, timeZone)}</td>
                    <td>{p.height.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2">No curve values available.</p>
        )}
      </details>
    </div>
  );
}
