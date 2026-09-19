import { z } from "zod";
import { Temporal } from "@js-temporal/polyfill";
import { calendarDate, dayBounds, localDate } from "./time";

const text = z.string().trim().min(1).max(4000);
const optionalText = text.optional();
const number = z.number().finite();
const count = number.int().nonnegative();
export const date = z.string().refine((v) => {
  try {
    calendarDate(v);
    return true;
  } catch {
    return false;
  }
}, "Use a real YYYY-MM-DD date");
export const timeZone = z.string().refine((v) => {
  try {
    Temporal.Now.zonedDateTimeISO(v);
    return true;
  } catch {
    return false;
  }
}, "Use an IANA time zone");
export const instant = z.string().refine((v) => {
  try {
    Temporal.Instant.from(v);
    return true;
  } catch {
    return false;
  }
}, "Use a timestamp with an explicit UTC offset");
export const safeLink = text.refine((v) => {
  if (/^\/(?!\/)/.test(v))
    return !/[\\\s]/.test(v) && !v.split(/[/?#]/).includes("..");
  try {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
}, "Use an https:// link or a local /path, without credentials");
export const mediaPath = z
  .string()
  .regex(/^\/media\/[a-zA-Z0-9_./-]+$/)
  .refine((v) => !v.split("/").includes(".."), "Media must be inside /media/");
const phone = z
  .string()
  .regex(/^\+?[0-9 ().-]{5,30}$/)
  .optional();
const headcount = z.strictObject({ adults: count, kids: count });
export const portalSchema = z
  .strictObject({
    brandName: text,
    title: text,
    description: text,
    currentYear: count.min(1000).max(9999),
    historyIntro: text,
    footer: text,
    demo: z.boolean(),
    demoNow: instant.optional(),
  })
  .refine((v) => v.demo || !v.demoNow, {
    message: "demoNow is only available in demo mode",
  });
export const tripSchema = z
  .strictObject({
    year: count.min(1000).max(9999),
    name: text,
    tagline: text,
    destination: text,
    startDate: date,
    endDate: date,
    timeZone,
    checkIn: instant,
    checkOut: instant,
    mealIntro: text,
    mealNotes: optionalText,
    featuredEvent: z
      .strictObject({
        title: text,
        description: text,
        url: safeLink.optional(),
      })
      .optional(),
    house: z.strictObject({
      name: text,
      address: text,
      beds: count,
      maxGuests: count,
      amenities: z.array(text),
      rules: z.array(text),
      hostPhone: phone,
      mapUrl: safeLink.optional(),
    }),
  })
  .superRefine((v, c) => {
    if (v.endDate < v.startDate)
      c.addIssue({
        code: "custom",
        message: "End date precedes start date",
        path: ["endDate"],
      });
    if (
      !instant.safeParse(v.checkIn).success ||
      !instant.safeParse(v.checkOut).success ||
      !timeZone.safeParse(v.timeZone).success
    )
      return;
    const a = Temporal.Instant.from(v.checkIn).epochMilliseconds,
      b = Temporal.Instant.from(v.checkOut).epochMilliseconds;
    if (b <= a)
      c.addIssue({
        code: "custom",
        message: "Check-out must follow check-in",
        path: ["checkOut"],
      });
    if (
      localDate(a, v.timeZone) !== v.startDate ||
      localDate(b, v.timeZone) !== v.endDate
    )
      c.addIssue({
        code: "custom",
        message:
          "Check-in/out must fall on the configured trip dates in the trip time zone",
      });
  });
export const eventSchema = z.strictObject({
  time: text,
  title: text,
  description: text,
  location: optionalText,
  type: z.enum(["activity", "meal", "ceremony", "travel", "free"]),
  highlight: z.boolean().optional(),
});
export const scheduleSchema = z.array(
  z.strictObject({
    date,
    dayOfWeek: text,
    label: text,
    events: z.array(eventSchema),
  }),
);
export const mealsSchema = z.array(
  z.strictObject({
    date,
    dayOfWeek: text,
    theme: text,
    chefs: z.array(text),
    menu: z.array(text),
    dietaryNotes: z.array(text).optional(),
    headcount,
  }),
);
export const packingSchema = z.array(
  z.strictObject({
    id: text,
    item: text,
    category: text,
    claimedBy: optionalText,
    quantity: count.positive().optional(),
    notes: optionalText,
  }),
);
export const guideSchema = z.array(
  z.strictObject({
    name: text,
    category: z.enum(["restaurant", "beach", "grocery", "activity", "info"]),
    description: text,
    address: optionalText,
    phone,
    hours: optionalText,
    tip: optionalText,
    mapUrl: safeLink.optional(),
  }),
);
export const peopleSchema = z.array(
  z.strictObject({
    name: text,
    family: text,
    attendance: z.enum(["confirmed", "tentative", "declined"]),
    role: optionalText,
    arrivalDate: date.optional(),
    departureDate: date.optional(),
    phone,
    email: z.email().optional(),
    dietaryNotes: optionalText,
    notes: optionalText,
  }),
);
export const photosSchema = z.array(
  z
    .strictObject({
      src: mediaPath.optional(),
      alt: text,
      year: count,
      caption: optionalText,
      credit: optionalText,
      type: z.enum(["photo", "video", "album-link"]).default("photo"),
      externalUrl: safeLink.optional(),
      poster: mediaPath.optional(),
      captions: mediaPath.optional(),
    })
    .superRefine((v, c) => {
      if (v.type === "album-link" ? !v.externalUrl : !v.src)
        c.addIssue({
          code: "custom",
          message: "Albums need externalUrl; photos and videos need src",
        });
    }),
);
export const historySchema = z.array(
  z.strictObject({
    year: count,
    name: text,
    dates: text,
    location: text,
    highlight: text,
    photoCount: count.optional(),
    heroImage: mediaPath.optional(),
    photoAlbumUrl: safeLink.optional(),
    accommodation: optionalText,
    accommodationType: z
      .enum(["condos", "house-and-condos", "house"])
      .optional(),
    attendeeCount: headcount.optional(),
    meals: z
      .array(z.strictObject({ night: text, chefs: text, dish: optionalText }))
      .optional(),
    mealFormat: z.enum(["competition", "themed", "casual"]).optional(),
    golf: z
      .strictObject({
        course: text,
        date: date.optional(),
        players: count.optional(),
        costPerPlayer: number.nonnegative().optional(),
      })
      .optional(),
    activities: z.array(text).optional(),
    traditions: z.array(text).optional(),
    notes: optionalText,
  }),
);
export const traditionsSchema = z.array(
  z.strictObject({
    id: text,
    name: text,
    description: text,
    yearsActive: text,
    icon: text,
    details: optionalText,
    relatedLink: safeLink.optional(),
  }),
);
const playlist = z.strictObject({
  id: text,
  name: text,
  person: text,
  relationship: text,
  videoCount: count,
  url: safeLink,
});
export const videosSchema = z.strictObject({
  intro: text,
  memorialIntro: optionalText,
  channel: z.strictObject({ name: text, url: safeLink }).optional(),
  playlists: z.array(playlist),
  beachVideos: z.array(
    z.strictObject({
      id: text,
      title: text,
      date,
      year: count,
      url: safeLink,
      thumbnail: mediaPath.optional(),
      people: z.array(text),
    }),
  ),
  memorial: z.array(
    z.strictObject({
      name: text,
      relationship: text,
      note: text,
      playlistUrl: safeLink.optional(),
      videoCount: count,
    }),
  ),
});
export const sampleSchema = z.strictObject({
  timestamp: number.int(),
  height: number,
});
export const extremumSchema = sampleSchema.extend({ type: z.enum(["H", "L"]) });
export const provenanceSchema = z.strictObject({
  kind: z.enum([
    "fictional",
    "noaa-prediction",
    "reference-derived",
    "solar-prediction",
    "unavailable",
  ]),
  description: text,
  stationId: optionalText,
  fetchedAt: instant.optional(),
  requestedStart: date.optional(),
  requestedEnd: date.optional(),
  timeShiftMinutes: number.optional(),
  heightScale: number.positive().optional(),
});
export const activitySchema = z
  .strictObject({
    id: text,
    ruleId: text,
    activity: text,
    label: text,
    startTimestamp: number.int(),
    endTimestamp: number.int(),
    quality: z.enum(["excellent", "good", "fair"]),
    reason: text,
    url: safeLink.optional(),
  })
  .refine(
    (v) => v.endTimestamp > v.startTimestamp,
    "Activity ends before it starts",
  );
export const tideDaySchema = z.strictObject({
  date,
  dayOfWeek: text,
  label: text,
  sunrise: number.int().optional(),
  sunset: number.int().optional(),
  sunSource: provenanceSchema,
  moonPhase: optionalText,
  highLow: z.array(extremumSchema),
  curve: z.array(sampleSchema),
  activities: z.array(activitySchema),
});
export const tidesSchema = z
  .strictObject({
    station: text,
    timeZone,
    units: z.enum(["ft", "m"]),
    datum: text,
    generated: instant,
    dateRange: z.strictObject({ start: date, end: date }),
    highLowSource: provenanceSchema,
    curveSource: provenanceSchema,
    curveIntervalMinutes: number.positive(),
    days: z.array(tideDaySchema),
  })
  .superRefine((v, c) => {
    if (
      !timeZone.safeParse(v.timeZone).success ||
      v.days.some((d) => !date.safeParse(d.date).success)
    )
      return;
    if (v.dateRange.end < v.dateRange.start)
      c.addIssue({ code: "custom", message: "Invalid tide date range" });
    const seen = new Set<string>();
    for (const [i, d] of v.days.entries()) {
      const issue = (message: string) =>
        c.addIssue({ code: "custom", message, path: ["days", i] });
      if (
        seen.has(d.date) ||
        d.date < v.dateRange.start ||
        d.date > v.dateRange.end
      )
        issue("Duplicate or out-of-range day");
      seen.add(d.date);
      const [a, b] = dayBounds(d.date, v.timeZone);
      for (const key of ["curve", "highLow"] as const)
        for (const [j, p] of d[key].entries()) {
          if (p.timestamp < a || p.timestamp >= b)
            issue("Sample is outside its local day");
          if (j && p.timestamp <= d[key][j - 1].timestamp)
            issue("Samples must have unique increasing timestamps");
        }
      for (const p of [d.sunrise, d.sunset])
        if (p !== undefined && (p < a || p >= b))
          issue("Sun event is outside its local day");
      for (const w of d.activities)
        if (w.startTimestamp < a || w.endTimestamp > b)
          issue("Activity must be clipped to its local day");
    }
  });
const minuteHour = number
  .min(0)
  .max(24)
  .refine(
    (v) => Math.abs(v * 60 - Math.round(v * 60)) < 1e-8,
    "Use whole-minute precision (for example 8.5 for 08:30)",
  );
export const ruleSchema = z
  .strictObject({
    id: text,
    activity: text,
    label: text,
    anchor: z.enum(["H", "L", "either"]),
    selection: z.enum(["all", "first-per-day"]).default("all"),
    anchorHours: z.tuple([minuteHour, minuteHour]).optional(),
    dates: z.array(date).optional(),
    weekdays: z.array(count.min(1).max(7)).optional(),
    openHours: z.tuple([minuteHour, minuteHour]).optional(),
    segments: z
      .array(
        z
          .strictObject({
            startMinutes: number.min(-1440).max(1440),
            endMinutes: number.min(-1440).max(1440),
            quality: z.enum(["excellent", "good", "fair"]),
            reason: text,
          })
          .refine(
            (v) => v.endMinutes > v.startMinutes,
            "Segment end must follow start",
          ),
      )
      .min(1),
    url: safeLink.optional(),
  })
  .superRefine((v, c) => {
    for (const key of ["anchorHours", "openHours"] as const)
      if (v[key] && v[key][0] >= v[key][1])
        c.addIssue({
          code: "custom",
          message: "Hour range must be increasing",
          path: [key],
        });
  });
