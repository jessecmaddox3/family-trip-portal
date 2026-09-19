import { promises as fs, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import * as S from "./schemas";

const CONTENT_DIR = path.resolve(
  process.env.PORTAL_CONTENT_DIR || path.join(process.cwd(), "content"),
);
export async function loadJson<T>(
  filePath: string,
  schema: z.ZodType<T>,
): Promise<T> {
  try {
    return schema.parse(JSON.parse(readFileSync(filePath, "utf8")));
  } catch (error) {
    if (error instanceof z.ZodError)
      throw new Error(
        `${path.basename(filePath)}: ${error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
      );
    throw error;
  }
}
function tripPath(year: number, file: string) {
  if (!Number.isInteger(year) || year < 1000 || year > 9999)
    throw new Error("Invalid trip year");
  return path.join(CONTENT_DIR, "trips", String(year), file + ".json");
}
export const getPortalConfig = () =>
  loadJson(
    path.resolve(process.env.PORTAL_CONFIG || "portal.config.json"),
    S.portalSchema,
  );
export const getTripInfo = (year: number) =>
  loadJson(tripPath(year, "trip"), S.tripSchema);
export const getSchedule = (year: number) =>
  loadJson(tripPath(year, "schedule"), S.scheduleSchema);
export const getMeals = (year: number) =>
  loadJson(tripPath(year, "meals"), S.mealsSchema);
export const getPacking = (year: number) =>
  loadJson(tripPath(year, "packing"), S.packingSchema);
export const getGuide = (year: number) =>
  loadJson(tripPath(year, "guide"), S.guideSchema);
export const getPeople = (year: number) =>
  loadJson(tripPath(year, "people"), S.peopleSchema);
export const getPhotos = (year: number) =>
  loadJson(tripPath(year, "photos"), S.photosSchema);
export const getTides = (year: number) =>
  loadJson(tripPath(year, "tides"), S.tidesSchema);
export const getTripHistory = () =>
  loadJson(path.join(CONTENT_DIR, "trips", "history.json"), S.historySchema);
export const getTraditions = () =>
  loadJson(
    path.join(CONTENT_DIR, "trips", "traditions.json"),
    S.traditionsSchema,
  );
export const getFamilyVideos = () =>
  loadJson(
    path.join(CONTENT_DIR, "trips", "family-videos.json"),
    S.videosSchema,
  );
export async function getAvailableYears(): Promise<number[]> {
  return readdirSync(path.join(CONTENT_DIR, "trips"), { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^[1-9]\d{3}$/.test(e.name))
    .map((e) => Number(e.name))
    .sort((a, b) => b - a);
}
export async function validateContent() {
  const config = await getPortalConfig(),
    years = await getAvailableYears();
  if (!years.includes(config.currentYear))
    throw new Error(
      "portal.config.json currentYear needs a complete content/trips/YYYY directory",
    );
  const unique = (values: string[], label: string) => {
    if (new Set(values).size !== values.length)
      throw new Error(`Duplicate ${label}`);
  };
  const [history, traditions, videos] = await Promise.all([
    getTripHistory(),
    getTraditions(),
    getFamilyVideos(),
  ]);
  unique(
    history.map((t) => String(t.year)),
    "history year",
  );
  unique(
    traditions.map((t) => t.id),
    "tradition ID",
  );
  unique(
    videos.beachVideos.map((v) => v.id),
    "video ID",
  );
  unique(
    videos.playlists.map((p) => p.id),
    "playlist ID",
  );
  for (const year of years) {
    const [trip, schedule, meals, packing, guide, people, photos, tides] =
      await Promise.all([
        getTripInfo(year),
        getSchedule(year),
        getMeals(year),
        getPacking(year),
        getGuide(year),
        getPeople(year),
        getPhotos(year),
        getTides(year),
      ]);
    if (trip.year !== year)
      throw new Error(`${year}/trip.json year differs from its folder`);
    if (
      tides.timeZone !== trip.timeZone ||
      tides.dateRange.start !== trip.startDate ||
      tides.dateRange.end !== trip.endDate
    )
      throw new Error(`${year}: tide dates/time zone differ from the trip`);
    unique(
      schedule.map((d) => d.date),
      "schedule day",
    );
    unique(
      meals.map((m) => m.date),
      "meal date",
    );
    unique(
      packing.map((p) => p.id),
      "packing ID",
    );
    unique(
      guide.map((g) => g.name),
      "guide name",
    );
    unique(
      people.map((p) => p.name),
      "attendee name",
    );
    for (const day of [...schedule, ...meals])
      if (day.date < trip.startDate || day.date > trip.endDate)
        throw new Error(`${year}: schedule/meal date outside trip`);
    for (const person of people)
      if (
        person.arrivalDate &&
        person.departureDate &&
        person.departureDate < person.arrivalDate
      )
        throw new Error(`${year}: attendee departure precedes arrival`);
    for (const photo of photos)
      if (photo.type !== "album-link" && photo.year !== year)
        throw new Error(`${year}: media year differs from folder`);
    for (const photo of photos)
      for (const item of [photo.src, photo.poster, photo.captions])
        if (item) await validateMedia(item);
  }
  for (const v of videos.beachVideos)
    if (v.thumbnail) await validateMedia(v.thumbnail);
  for (const t of history) if (t.heroImage) await validateMedia(t.heroImage);
  return years;
}

async function validateMedia(value: string) {
  const root = await fs.realpath(path.join(process.cwd(), "public"));
  const file = await fs.realpath(path.join(root, value.slice(1)));
  if (!file.startsWith(root + path.sep) || !(await fs.stat(file)).isFile())
    throw new Error(`Media must be a file inside public/: ${value}`);
}
