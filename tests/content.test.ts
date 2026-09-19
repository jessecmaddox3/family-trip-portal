import { test } from "node:test";
import assert from "node:assert/strict";
import {
  portalSchema,
  tripSchema,
  photosSchema,
  ruleSchema,
  tidesSchema,
  safeLink,
  mediaPath,
} from "../src/lib/schemas";
import {
  validateContent,
  getTripInfo,
  getTides,
  getTripHistory,
  getMeals,
} from "../src/lib/content";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import PhotoGrid from "../src/components/PhotoGrid";
import FamilyVideoSection from "../src/components/FamilyVideoSection";
import WeekStrip from "../src/components/WeekStrip";
import TidePageClient from "../src/components/TidePageClient";
import HistoryCard from "../src/components/HistoryCard";
test("the complete invented case validates and history meal facts agree", async () => {
  assert.deepEqual(await validateContent(), [2034, 2033]);
  for (const year of [2033, 2034]) {
    const history = (await getTripHistory()).find((t) => t.year === year)!,
      meals = await getMeals(year);
    assert.deepEqual(history.attendeeCount, meals[0].headcount);
    assert.match(history.meals![0].chefs, /Noor and Ari/);
  }
});
test("schemas reject bad calendars and unsafe links without throwing", async () => {
  const trip = await getTripInfo(2034);
  assert.equal(
    tripSchema.safeParse({ ...trip, startDate: "2034-02-30" }).success,
    false,
  );
  assert.equal(
    tripSchema.safeParse({ ...trip, timeZone: "Mars/Crater" }).success,
    false,
  );
  assert.equal(
    tripSchema.safeParse({ ...trip, checkIn: "tomorrow" }).success,
    false,
  );
  assert.equal(
    tripSchema.safeParse({
      ...trip,
      checkIn: trip.checkIn + "[America/New_York]",
    }).success,
    true,
  );
  assert.equal(portalSchema.safeParse({}).success, false);
  for (const url of [
    "javascript:alert(1)",
    "//example.invalid/a",
    "https://user:password@example.invalid/a",
    "/../private",
    "/\\evil",
  ])
    assert.equal(safeLink.safeParse(url).success, false);
  assert.equal(mediaPath.safeParse("/media/../private").success, false);
  assert.equal(
    photosSchema.safeParse([{ type: "video", alt: "Missing src", year: 2034 }])
      .success,
    false,
  );
  assert.equal(ruleSchema.safeParse({}).success, false);
  const tides = await getTides(2034);
  assert.equal(
    tidesSchema.safeParse({
      ...tides,
      days: [{ ...tides.days[0], date: "2034-02-30" }],
    }).success,
    false,
  );
});
test("empty and single-point tide views remain usable", async () => {
  const tides = await getTides(2034),
    day = { ...tides.days[0], curve: [], highLow: [], activities: [] };
  for (const curve of [[], [{ timestamp: day.sunrise!, height: -2 }]]) {
    const markup = renderToStaticMarkup(
      React.createElement(WeekStrip, {
        days: [{ ...day, curve }],
        selectedIndex: 0,
        onSelect: () => {},
        timeZone: tides.timeZone,
        intervalMinutes: 15,
      }),
    );
    assert.equal(markup.includes("NaN"), false);
  }
  assert.match(
    renderToStaticMarkup(
      React.createElement(TidePageClient, { tides: { ...tides, days: [] } }),
    ),
    /No tide days available/,
  );
});
test("gallery videos and all archive entries render, including more than six", () => {
  const photos = photosSchema.parse([
    {
      type: "video",
      src: "/media/clip.webm",
      alt: "A synthetic clip",
      year: 2034,
    },
  ]);
  assert.match(
    renderToStaticMarkup(React.createElement(PhotoGrid, { photos })),
    /<video/,
  );
  const data = {
    intro: "Example",
    playlists: [],
    memorial: [],
    beachVideos: Array.from({ length: 7 }, (_, i) => ({
      id: String(i),
      title: `Clip ${i + 1}`,
      date: "2034-08-12",
      year: 2034,
      url: "/media/clip.webm",
      people: [],
    })),
  };
  assert.match(
    renderToStaticMarkup(React.createElement(FamilyVideoSection, { data })),
    /Clip 7/,
  );
});
test("history-only years have no invented trip link, and supplied details render", () => {
  const trip = {
    year: 2031,
    name: "Invented memory",
    dates: "A day",
    location: "Imaginary meadow",
    highlight: "A story",
    accommodation: "Sample cottage",
    accommodationType: "house" as const,
    photoCount: 0,
  };
  const html = renderToStaticMarkup(
    React.createElement(HistoryCard, { trip, hasTrip: false }),
  );
  assert.doesNotMatch(html, /href="\/trip\/2031/);
  assert.match(html, /Invented memory/);
  assert.match(html, /Sample cottage/);
  assert.match(html, /0 photos/);
});
