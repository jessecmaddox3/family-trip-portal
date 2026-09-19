"use client";
import { useState } from "react";
import type { TideData } from "@/lib/types";
import { formatClock } from "@/lib/time";
import WeekStrip from "./WeekStrip";
import TideDayChart from "./TideDayChart";
import ActivityPanel from "./ActivityPanel";
export default function TidePageClient({ tides }: { tides: TideData }) {
  const [index, setIndex] = useState(0),
    selected = Math.min(index, Math.max(0, tides.days.length - 1)),
    day = tides.days[selected];
  return (
    <div>
      <div className="bg-sand-100 border border-sand-200 rounded-xl p-4 text-sm text-drift-400 mb-6">
        <p>
          <strong>High/low:</strong> {tides.highLowSource.description}
          {tides.highLowSource.stationId &&
            ` Station ${tides.highLowSource.stationId}.`}
        </p>
        <p className="mt-2">
          <strong>Curve:</strong> {tides.curveSource.description}
          {tides.curveSource.stationId &&
            ` Station ${tides.curveSource.stationId}.`}
          {tides.curveSource.timeShiftMinutes !== undefined &&
            ` Shift ${tides.curveSource.timeShiftMinutes} minutes; height × ${tides.curveSource.heightScale}.`}
        </p>
        <p className="mt-2">
          All times: {tides.timeZone}. Heights: {tides.units}, datum{" "}
          {tides.datum}.
        </p>
      </div>
      {!day ? (
        <p>No tide days available. Add validated data for this trip.</p>
      ) : (
        <>
          <WeekStrip
            days={tides.days}
            selectedIndex={selected}
            onSelect={setIndex}
            timeZone={tides.timeZone}
            intervalMinutes={tides.curveIntervalMinutes}
          />
          <div className="mt-6">
            <div className="flex flex-wrap gap-3 items-baseline justify-between mb-4">
              <div>
                <h2 className="font-heading text-xl font-semibold text-ocean-500">
                  {day.dayOfWeek} · {day.label}
                </h2>
                <p className="text-sm text-drift-400">{day.date}</p>
              </div>
              <div className="text-sm text-drift-400">
                <p>
                  Sunrise:{" "}
                  {day.sunrise === undefined
                    ? "unavailable"
                    : formatClock(day.sunrise, tides.timeZone)}
                </p>
                <p>
                  Sunset:{" "}
                  {day.sunset === undefined
                    ? "unavailable"
                    : formatClock(day.sunset, tides.timeZone)}
                </p>
                <p>Moon: {day.moonPhase || "unavailable"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {day.highLow.map((p) => (
                <span
                  key={p.timestamp}
                  className={`text-xs px-3 py-2 rounded-full font-medium border ${p.type === "H" ? "bg-ocean-50 text-ocean-500 border-ocean-200" : "bg-sand-100 text-drift-500 border-sand-200"}`}
                >
                  {p.type === "H" ? "▲ High" : "▼ Low"}{" "}
                  {formatClock(p.timestamp, tides.timeZone)} (
                  {p.height.toFixed(2)} {tides.units})
                </span>
              ))}
            </div>
            <TideDayChart
              day={day}
              timeZone={tides.timeZone}
              units={tides.units}
              intervalMinutes={tides.curveIntervalMinutes}
            />
            <p className="text-xs text-drift-400 mt-3">
              {day.sunSource.description}
              {day.sunSource.kind === "solar-prediction" && (
                <>
                  {" "}
                  <a className="underline" href="https://sunrisesunset.io">
                    Powered by SunriseSunset.io
                  </a>
                  .
                </>
              )}
            </p>
            <ActivityPanel
              activities={day.activities}
              timeZone={tides.timeZone}
            />
          </div>
        </>
      )}
    </div>
  );
}
