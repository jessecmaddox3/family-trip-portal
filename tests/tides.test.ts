import { test } from "node:test";
import assert from "node:assert/strict";
import { buildActivityWindows, parseNoaaPredictions } from "../src/lib/tides";
import { ruleSchema } from "../src/lib/schemas";
import { localInstant, dayBounds } from "../src/lib/time";
const zone = "America/New_York";
const rule = ruleSchema.parse({
  id: "walk",
  activity: "beach",
  label: "Evening walk",
  anchor: "H",
  segments: [
    {
      startMinutes: -120,
      endMinutes: 60,
      quality: "good",
      reason: "Organizer preference",
    },
  ],
});
test("next-day extrema create previous-evening windows", () => {
  const peak = {
    timestamp: localInstant("2030-07-10", "00:30", zone),
    height: 2,
    type: "H" as const,
  };
  const before = buildActivityWindows("2030-07-09", zone, [peak], [rule]);
  const after = buildActivityWindows("2030-07-10", zone, [peak], [rule]);
  assert.equal(
    before[0].startTimestamp,
    localInstant("2030-07-09", "22:30", zone),
  );
  assert.equal(before[0].endTimestamp, dayBounds("2030-07-09", zone)[1]);
  assert.equal(
    after[0].endTimestamp,
    localInstant("2030-07-10", "01:30", zone),
  );
  assert.equal(before[0].id, after[0].id);
});
test("venue weekday closure applies to fragments, not just anchors", () => {
  const peak = {
    timestamp: localInstant("2030-07-09", "23:30", zone),
    height: 2,
    type: "H" as const,
  };
  const weekdays = [1, 2, 4, 5, 6, 7]; // closed Wednesday
  assert.equal(
    buildActivityWindows("2030-07-10", zone, [peak], [{ ...rule, weekdays }])
      .length,
    0,
  );
  assert.equal(
    buildActivityWindows("2030-07-09", zone, [peak], [{ ...rule, weekdays }])
      .length,
    1,
  );
});
test("first-morning selection, date filters, opening hours and quality segments", () => {
  const peaks = ["06:00", "10:00", "18:00"].map((t) => ({
    timestamp: localInstant("2030-07-10", t, zone),
    height: 2,
    type: "H" as const,
  }));
  const filtered = ruleSchema.parse({
    ...rule,
    selection: "first-per-day",
    anchorHours: [0, 12],
    dates: ["2030-07-10"],
    openHours: [5, 8],
    segments: [
      { startMinutes: -120, endMinutes: 0, quality: "good", reason: "Before" },
      {
        startMinutes: 0,
        endMinutes: 120,
        quality: "excellent",
        reason: "After",
      },
    ],
  });
  const windows = buildActivityWindows("2030-07-10", zone, peaks, [filtered]);
  assert.equal(windows.length, 2);
  assert.equal(
    windows[0].startTimestamp,
    localInstant("2030-07-10", "05:00", zone),
  );
  assert.equal(windows[1].quality, "excellent");
  assert.equal(
    buildActivityWindows("2030-07-11", zone, peaks, [filtered]).length,
    0,
  );
});
test("NOAA GMT parser validates values and deduplicates without guessing", () => {
  const a = { t: "2030-07-10 00:00", v: "-0.40", type: "L" };
  const out = parseNoaaPredictions({ predictions: [a, a] }, true);
  assert.equal(out.length, 1);
  assert.equal(out[0].height, -0.4);
  assert.equal(
    new Date(out[0].timestamp).toISOString(),
    "2030-07-10T00:00:00.000Z",
  );
  for (const bad of [
    { ...a, v: "" },
    { ...a, v: "NaN" },
    { ...a, v: "3 ft" },
    { ...a, type: "X" },
    { ...a, t: "2030-02-30 00:00" },
  ])
    assert.throws(() => parseNoaaPredictions({ predictions: [bad] }, true));
  assert.throws(() =>
    parseNoaaPredictions({ predictions: [a, { ...a, v: "2" }] }, true),
  );
  assert.throws(() =>
    parseNoaaPredictions({ error: { message: "No station" } }, true),
  );
});

test("opening intervals preserve both repeated-hour portions, without including closed minutes", () => {
  const peak = {
    timestamp: Date.parse("2030-11-03T06:00:00Z"),
    height: 2,
    type: "H" as const,
  };
  const r = ruleSchema.parse({
    ...rule,
    openHours: [1.5, 1.75],
    segments: [
      {
        startMinutes: -180,
        endMinutes: 180,
        quality: "good",
        reason: "Opening interval",
      },
    ],
  });
  const windows = buildActivityWindows("2030-11-03", zone, [peak], [r]);
  assert.deepEqual(
    windows.map((w) => [
      new Date(w.startTimestamp).toISOString(),
      new Date(w.endTimestamp).toISOString(),
    ]),
    [
      ["2030-11-03T05:30:00.000Z", "2030-11-03T05:45:00.000Z"],
      ["2030-11-03T06:30:00.000Z", "2030-11-03T06:45:00.000Z"],
    ],
  );
  assert.equal(
    ruleSchema.safeParse({ ...rule, openHours: [0, 23.999] }).success,
    false,
  );
  const spring = { ...peak, timestamp: Date.parse("2030-03-10T07:00:00Z") };
  assert.equal(
    buildActivityWindows(
      "2030-03-10",
      zone,
      [spring],
      [{ ...r, openHours: [2, 3] }],
    ).length,
    0,
  );
});
