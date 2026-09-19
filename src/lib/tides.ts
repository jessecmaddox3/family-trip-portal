import { Temporal } from "@js-temporal/polyfill";
import type {
  ActivityRule,
  ActivityWindow,
  TideCurvePoint,
  TidePoint,
} from "./types";
import { calendarDate, dayBounds, localDate } from "./time";

export function parseNoaaPredictions(data: unknown, extrema: true): TidePoint[];
export function parseNoaaPredictions(
  data: unknown,
  extrema: false,
): TideCurvePoint[];
export function parseNoaaPredictions(
  data: unknown,
  extrema: boolean,
): (TideCurvePoint | TidePoint)[] {
  if (
    !data ||
    typeof data !== "object" ||
    !("predictions" in data) ||
    !Array.isArray(data.predictions) ||
    !data.predictions.length
  )
    throw new Error("NOAA returned no predictions");
  const unique = new Map<number, TideCurvePoint | TidePoint>();
  for (const row of data.predictions) {
    if (
      !row ||
      typeof row !== "object" ||
      typeof row.t !== "string" ||
      !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(row.t)
    )
      throw new Error("Malformed NOAA timestamp");
    calendarDate(row.t.slice(0, 10));
    const timestamp = Temporal.Instant.from(
      row.t.replace(" ", "T") + ":00Z",
    ).epochMilliseconds;
    if (
      typeof row.v !== "string" ||
      !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(row.v.trim())
    )
      throw new Error("Malformed NOAA height");
    const height = Number(row.v);
    if (!Number.isFinite(height)) throw new Error("Non-finite NOAA height");
    if (extrema && row.type !== "H" && row.type !== "L")
      throw new Error("Malformed NOAA high/low type");
    const sample = extrema
      ? { timestamp, height, type: row.type as "H" | "L" }
      : { timestamp, height };
    const old = unique.get(timestamp);
    if (old && JSON.stringify(old) !== JSON.stringify(sample))
      throw new Error("Conflicting NOAA predictions at one instant");
    unique.set(timestamp, sample);
  }
  return [...unique.values()].sort((a, b) => a.timestamp - b.timestamp);
}

function openingIntervals(
  date: string,
  zone: string,
  hours?: [number, number],
): [number, number][] {
  const [start, end] = dayBounds(date, zone);
  if (!hours) return [[start, end]];
  const result: [number, number][] = [];
  // Classify actual minutes by their local clock. A repeated autumn interval appears twice;
  // nonexistent spring minutes never appear. No guessed inverse timezone conversion.
  for (let t = start; t < end; t += 60000) {
    const local =
        Temporal.Instant.fromEpochMilliseconds(t).toZonedDateTimeISO(zone),
      minute = local.hour * 60 + local.minute;
    if (
      minute >= Math.round(hours[0] * 60) &&
      minute < Math.round(hours[1] * 60)
    ) {
      const last = result.at(-1);
      if (last && last[1] === t) last[1] = Math.min(t + 60000, end);
      else result.push([t, Math.min(t + 60000, end)]);
    }
  }
  return result;
}
export function buildActivityWindows(
  date: string,
  zone: string,
  extrema: TidePoint[],
  rules: ActivityRule[],
): ActivityWindow[] {
  const [start, end] = dayBounds(date, zone),
    weekday = calendarDate(date).dayOfWeek;
  const result: ActivityWindow[] = [];
  for (const rule of rules) {
    if (rule.dates && !rule.dates.includes(date)) continue;
    if (rule.weekdays && !rule.weekdays.includes(weekday)) continue;
    const openings = openingIntervals(date, zone, rule.openHours);
    const seen = new Set<string>();
    for (const peak of [...extrema].sort((a, b) => a.timestamp - b.timestamp)) {
      if (rule.anchor !== "either" && peak.type !== rule.anchor) continue;
      const zoned = Temporal.Instant.fromEpochMilliseconds(
          peak.timestamp,
        ).toZonedDateTimeISO(zone),
        hour = zoned.hour + zoned.minute / 60;
      if (
        rule.anchorHours &&
        (hour < rule.anchorHours[0] || hour >= rule.anchorHours[1])
      )
        continue;
      const anchorDate = localDate(peak.timestamp, zone);
      if (rule.selection === "first-per-day" && seen.has(anchorDate)) continue;
      seen.add(anchorDate);
      rule.segments.forEach((segment, i) => {
        for (const [open, close] of openings) {
          const a = Math.max(
            start,
            open,
            peak.timestamp + segment.startMinutes * 60000,
          );
          const b = Math.min(
            end,
            close,
            peak.timestamp + segment.endMinutes * 60000,
          );
          if (b > a)
            result.push({
              id: `${rule.id}:${peak.timestamp}:${i}`,
              ruleId: rule.id,
              activity: rule.activity,
              label: rule.label,
              startTimestamp: a,
              endTimestamp: b,
              quality: segment.quality,
              reason: segment.reason,
              ...(rule.url ? { url: rule.url } : {}),
            });
        }
      });
    }
  }
  return result.sort(
    (a, b) =>
      a.startTimestamp - b.startTimestamp ||
      a.endTimestamp - b.endTimestamp ||
      a.id.localeCompare(b.id),
  );
}
