import { Temporal } from "@js-temporal/polyfill";

export function calendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("Use a YYYY-MM-DD date");
  return Temporal.PlainDate.from(value, { overflow: "reject" });
}
export function dayBounds(date: string, zone: string): [number, number] {
  const d = calendarDate(date);
  return [
    d.toZonedDateTime(zone).epochMilliseconds,
    d.add({ days: 1 }).toZonedDateTime(zone).epochMilliseconds,
  ];
}
export function localInstant(date: string, time: string, zone: string): number {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    throw new Error("Use an HH:mm clock time");
  return calendarDate(date)
    .toPlainDateTime(time)
    .toZonedDateTime(zone, { disambiguation: "reject" }).epochMilliseconds;
}
export function localDate(timestamp: number, zone: string): string {
  return Temporal.Instant.fromEpochMilliseconds(timestamp)
    .toZonedDateTimeISO(zone)
    .toPlainDate()
    .toString();
}
export function dateLabel(
  date: string,
  zone: string,
  options: Intl.DateTimeFormatOptions = {},
) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    ...options,
  }).format(dayBounds(date, zone)[0]);
}
export function formatClock(timestamp: number, zone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "shortOffset",
  }).format(timestamp);
}
export function shiftSample<T extends { timestamp: number; height: number }>(
  sample: T,
  minutes: number,
  scale: number,
): T {
  if (
    ![sample.timestamp, sample.height, minutes, scale].every(Number.isFinite) ||
    scale <= 0
  )
    throw new Error("Invalid calibration");
  return {
    ...sample,
    timestamp: sample.timestamp + minutes * 60000,
    height: sample.height * scale,
  };
}
export function chartSeries(
  points: { timestamp: number; height: number }[],
  intervalMs: number,
) {
  const result: { timestamp: number; height: number | null }[] = [];
  points.forEach((point, i) => {
    if (i && point.timestamp - points[i - 1].timestamp > intervalMs * 1.5)
      result.push({
        timestamp: points[i - 1].timestamp + intervalMs,
        height: null,
      });
    result.push(point);
  });
  return result;
}
export function datesBetween(start: string, end: string): string[] {
  const first = calendarDate(start),
    last = calendarDate(end);
  const span = first.until(last).days;
  if (span < 0 || span > 366)
    throw new Error("Date range must be in order and at most 367 days");
  return Array.from({ length: span + 1 }, (_, i) =>
    first.add({ days: i }).toString(),
  );
}
export function instantMilliseconds(value: string) {
  return Temporal.Instant.from(value).epochMilliseconds;
}
export function formatArrival(value: string, zone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(instantMilliseconds(value));
}
