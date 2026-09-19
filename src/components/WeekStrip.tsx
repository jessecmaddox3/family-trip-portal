"use client";
import type { TideDay } from "@/lib/types";
import { dayBounds, formatClock, chartSeries } from "@/lib/time";
export default function WeekStrip({
  days,
  selectedIndex,
  onSelect,
  timeZone,
  intervalMinutes,
}: {
  days: TideDay[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  timeZone: string;
  intervalMinutes: number;
}) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-2">
      <div className="flex gap-2 min-w-max">
        {days.map((day, i) => {
          const selected = i === selectedIndex,
            [start, end] = dayBounds(day.date, timeZone),
            heights = day.curve.map((p) => p.height),
            min = Math.min(...heights, 0),
            max = Math.max(...heights, 1),
            range = max - min || 1;
          let pen = false;
          const d = chartSeries(day.curve, intervalMinutes * 60000)
            .map((p) => {
              if (p.height === null) {
                pen = false;
                return "";
              }
              const command = pen ? "L" : "M";
              pen = true;
              return `${command}${(((p.timestamp - start) / (end - start)) * 80).toFixed(2)},${(24 - ((p.height - min) / range) * 24).toFixed(2)}`;
            })
            .join(" ");
          const high = day.highLow.find((p) => p.type === "H");
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelect(i)}
              aria-pressed={selected}
              aria-label={`${day.dayOfWeek}, ${day.label}`}
              className={`shrink-0 rounded-xl px-3 py-2.5 text-left transition-all min-w-[120px] ${selected ? "bg-ocean-500 text-white shadow-md" : "bg-white text-drift-500 border border-sand-100 hover:border-ocean-200"}`}
            >
              <p
                className={`text-xs font-medium ${selected ? "text-ocean-100" : "text-drift-400"}`}
              >
                {day.dayOfWeek.slice(0, 3)}
              </p>
              <p
                className={`text-sm font-semibold ${selected ? "text-white" : "text-ocean-500"}`}
              >
                {day.label}
              </p>
              {day.curve.length ? (
                <svg
                  viewBox="0 0 80 26"
                  className="w-full h-6 mt-1"
                  aria-hidden="true"
                >
                  <path
                    d={d}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  {day.curve.length === 1 && (
                    <circle
                      cx={
                        ((day.curve[0].timestamp - start) / (end - start)) * 80
                      }
                      cy={24 - ((day.curve[0].height - min) / range) * 24}
                      r="2"
                      fill="currentColor"
                    />
                  )}
                </svg>
              ) : (
                <p className="text-xs my-2">No curve</p>
              )}
              <p
                className={`text-[10px] mt-1 ${selected ? "text-ocean-100" : "text-drift-400"}`}
              >
                {high
                  ? `▲ ${formatClock(high.timestamp, timeZone)}`
                  : "No high listed"}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
