import { z } from "zod";
import { Temporal } from "@js-temporal/polyfill";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { date, timeZone, ruleSchema, tidesSchema, instant } from "./schemas";
import {
  calendarDate,
  datesBetween,
  dayBounds,
  dateLabel,
  shiftSample,
} from "./time";
import { parseNoaaPredictions, buildActivityWindows } from "./tides";
import type { TideData, TideCurvePoint } from "./types";
const stationId = z
  .string()
  .regex(/^\d{7}$/)
  .refine((v) => v !== "0000000", "Choose a real NOAA station explicitly");
export const fetchConfigSchema = z
  .strictObject({
    stationName: z.string().trim().min(1),
    stationId,
    timeZone,
    start: date,
    end: date,
    units: z.enum(["ft", "m"]),
    datum: z.enum(["MLLW", "MSL", "MHW", "MHHW", "MLW", "MTL", "NAVD", "STND"]),
    curve: z
      .strictObject({
        stationId,
        timeShiftMinutes: z.number().int().min(-1440).max(1440),
        heightScale: z.number().finite().positive().max(10),
      })
      .optional(),
    solar: z
      .strictObject({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
      .optional(),
    rules: z.array(ruleSchema),
  })
  .superRefine((v, c) => {
    if (!date.safeParse(v.start).success || !date.safeParse(v.end).success)
      return;
    const span = calendarDate(v.start).until(calendarDate(v.end)).days;
    if (span < 0 || span > 20)
      c.addIssue({
        code: "custom",
        message: "Fetch between 1 and 21 days at a time",
      });
  });
export type FetchJSON = (url: URL) => Promise<unknown>;
export async function requestJSON(url: URL): Promise<unknown> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    redirect: "error",
    headers: { accept: "application/json" },
  });
  if (!response.ok)
    throw new Error(`Provider returned HTTP ${response.status}`);
  if (Number(response.headers.get("content-length")) > 10_000_000)
    throw new Error("Provider response too large");
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty provider response");
  let length = 0;
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 10_000_000) throw new Error("Provider response too large");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
export async function fetchTideData(
  input: unknown,
  request: FetchJSON = requestJSON,
  generated = new Date().toISOString(),
): Promise<TideData> {
  const cfg = fetchConfigSchema.parse(input);
  instant.parse(generated);
  // Full UTC dates beyond both local boundaries cover calibration and activity anchors.
  const offsets = cfg.rules.flatMap((r) =>
    r.segments.flatMap((s) => [
      Math.abs(s.startMinutes),
      Math.abs(s.endMinutes),
    ]),
  );
  const padding =
    2 +
    Math.ceil(
      (Math.max(0, ...offsets) + Math.abs(cfg.curve?.timeShiftMinutes ?? 0)) /
        1440,
    );
  const requestedStart = calendarDate(cfg.start)
      .subtract({ days: padding })
      .toString(),
    requestedEnd = calendarDate(cfg.end).add({ days: padding }).toString();
  const makeUrl = (id: string, interval: string) => {
    const url = new URL(
      "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter",
    );
    for (const [key, value] of Object.entries({
      product: "predictions",
      application: "family-trip-portal",
      begin_date: requestedStart.replaceAll("-", ""),
      end_date: requestedEnd.replaceAll("-", ""),
      station: id,
      datum: cfg.datum,
      time_zone: "gmt",
      units: cfg.units === "ft" ? "english" : "metric",
      interval,
      format: "json",
    }))
      url.searchParams.set(key, value);
    return url;
  };
  const highLow = parseNoaaPredictions(
    await request(makeUrl(cfg.stationId, "hilo")),
    true,
  );
  const [tripStart] = dayBounds(cfg.start, cfg.timeZone),
    [, tripEnd] = dayBounds(cfg.end, cfg.timeZone);
  const segmentStarts = cfg.rules.flatMap((r) =>
      r.segments.map((s) => s.startMinutes),
    ),
    segmentEnds = cfg.rules.flatMap((r) => r.segments.map((s) => s.endMinutes));
  const earliestAnchor = tripStart - Math.max(0, ...segmentEnds) * 60000,
    latestAnchor = tripEnd - Math.min(0, ...segmentStarts) * 60000;
  const firstAnchorDate = Temporal.Instant.fromEpochMilliseconds(earliestAnchor)
    .toZonedDateTimeISO(cfg.timeZone)
    .toPlainDate()
    .toString();
  const horizonStart = cfg.rules.some((r) => r.selection === "first-per-day")
    ? dayBounds(firstAnchorDate, cfg.timeZone)[0]
    : earliestAnchor;
  if (
    highLow[0].timestamp >= horizonStart ||
    highLow.at(-1)!.timestamp <= latestAnchor
  )
    throw new Error(
      "High/low coverage does not bracket the activity-anchor horizon",
    );

  let curve: TideCurvePoint[] = [];
  if (cfg.curve) {
    const calibration = cfg.curve;
    curve = parseNoaaPredictions(
      await request(makeUrl(calibration.stationId, "6")),
      false,
    ).map((s) =>
      shiftSample(s, calibration.timeShiftMinutes, calibration.heightScale),
    );
    const [start] = dayBounds(cfg.start, cfg.timeZone),
      [, end] = dayBounds(cfg.end, cfg.timeZone);
    const relevant = curve.filter(
      (s) => s.timestamp >= start - 360000 && s.timestamp <= end + 360000,
    );
    if (
      !relevant.length ||
      relevant[0].timestamp > start ||
      relevant.at(-1)!.timestamp < end - 360000 ||
      relevant.some(
        (p, i) => i > 0 && p.timestamp - relevant[i - 1].timestamp > 360000,
      )
    )
      throw new Error(
        "Required curve does not cover the requested dates at six-minute intervals",
      );
  }
  const provenance = {
    stationId: cfg.stationId,
    fetchedAt: generated,
    requestedStart,
    requestedEnd,
  };
  const days: TideData["days"] = [];
  for (const day of datesBetween(cfg.start, cfg.end)) {
    const [start, end] = dayBounds(day, cfg.timeZone),
      points = highLow.filter((p) => p.timestamp >= start && p.timestamp < end);
    if (!points.length) throw new Error(`No high/low predictions for ${day}`);
    let sunrise: number | undefined,
      sunset: number | undefined,
      moonPhase: string | undefined;
    if (cfg.solar) {
      const url = new URL("https://api.sunrisesunset.io/json");
      for (const [k, v] of Object.entries({
        lat: String(cfg.solar.latitude),
        lng: String(cfg.solar.longitude),
        date: day,
        timezone: cfg.timeZone,
        time_format: "unix",
      }))
        url.searchParams.set(k, v);
      const result = z
        .object({
          status: z.literal("OK"),
          results: z.object({
            date: z.literal(day),
            sunrise: z.number().finite().nullable(),
            sunset: z.number().finite().nullable(),
            moon_phase: z.string().min(1).optional(),
          }),
        })
        .parse(await request(url)).results;
      sunrise =
        result.sunrise === null ? undefined : Math.round(result.sunrise * 1000);
      sunset =
        result.sunset === null ? undefined : Math.round(result.sunset * 1000);
      moonPhase = result.moon_phase;
    }
    days.push({
      date: day,
      dayOfWeek: dateLabel(day, cfg.timeZone, { weekday: "long" }),
      label: dateLabel(day, cfg.timeZone, { month: "short", day: "numeric" }),
      highLow: points,
      curve: curve.filter((p) => p.timestamp >= start && p.timestamp < end),
      activities: buildActivityWindows(day, cfg.timeZone, highLow, cfg.rules),
      ...(sunrise === undefined ? {} : { sunrise }),
      ...(sunset === undefined ? {} : { sunset }),
      ...(moonPhase ? { moonPhase } : {}),
      sunSource: cfg.solar
        ? {
            kind: "solar-prediction",
            description:
              "Solar and lunar predictions from SunriseSunset.io; unavailable events are omitted.",
            fetchedAt: generated,
            requestedStart: day,
            requestedEnd: day,
          }
        : {
            kind: "unavailable",
            description: "Solar acquisition was not configured.",
          },
    });
  }
  return tidesSchema.parse({
    station: cfg.stationName,
    timeZone: cfg.timeZone,
    units: cfg.units,
    datum: cfg.datum,
    generated,
    dateRange: { start: cfg.start, end: cfg.end },
    highLowSource: {
      kind: "noaa-prediction",
      description: "NOAA high/low predictions, not observed conditions.",
      ...provenance,
    },
    curveSource: cfg.curve
      ? {
          kind:
            cfg.curve.stationId !== cfg.stationId ||
            cfg.curve.timeShiftMinutes !== 0 ||
            cfg.curve.heightScale !== 1
              ? "reference-derived"
              : "noaa-prediction",
          description:
            "NOAA six-minute predictions with the explicitly configured time and height adjustments.",
          ...provenance,
          ...cfg.curve,
        }
      : {
          kind: "unavailable",
          description:
            "No six-minute curve requested. Some stations provide high/low predictions only.",
        },
    curveIntervalMinutes: 6,
    days,
  });
}
export async function writeTideData(
  file: string,
  input: unknown,
): Promise<void> {
  const data = tidesSchema.parse(input),
    destination = path.resolve(file);
  try {
    tidesSchema.parse(JSON.parse(await fs.readFile(destination, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT")
      throw new Error(
        "Existing output is not valid tide data; choose a new output file",
        { cause: error },
      );
  }
  const temporary = destination + `.${randomUUID()}.tmp`;
  try {
    await fs.writeFile(temporary, JSON.stringify(data, null, 2) + "\n", {
      flag: "wx",
      mode: 0o600,
    });
    await fs.rename(temporary, destination);
  } finally {
    await fs.rm(temporary, { force: true });
  }
}
