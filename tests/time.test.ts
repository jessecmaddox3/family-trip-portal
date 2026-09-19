import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dayBounds,
  localInstant,
  localDate,
  formatClock,
  shiftSample,
  chartSeries,
} from "../src/lib/time";
const zone = "America/New_York";
test("calendar days follow the trip zone, including DST", () => {
  assert.equal(
    new Date(localInstant("2030-07-10", "06:00", zone)).toISOString(),
    "2030-07-10T10:00:00.000Z",
  );
  assert.equal(
    dayBounds("2030-03-10", zone)[1] - dayBounds("2030-03-10", zone)[0],
    23 * 3600000,
  );
  assert.equal(
    dayBounds("2030-11-03", zone)[1] - dayBounds("2030-11-03", zone)[0],
    25 * 3600000,
  );
  assert.throws(() => localInstant("2030-03-10", "02:30", zone));
  assert.throws(() => localInstant("2030-11-03", "01:30", zone));
  assert.throws(() => dayBounds("2030-02-30", zone));
});
test("calibration crosses midnight without wrapping the date", () => {
  const shifted = shiftSample(
    { timestamp: localInstant("2030-07-10", "00:06", zone), height: 2 },
    -25,
    0.5,
  );
  assert.equal(localDate(shifted.timestamp, zone), "2030-07-09");
  assert.equal(shifted.height, 1);
  assert.match(formatClock(shifted.timestamp, zone), /11:41/);
});
test("chart inserts gaps without inventing samples or dividing by zero", () => {
  assert.deepEqual(chartSeries([], 360000), []);
  assert.deepEqual(chartSeries([{ timestamp: 0, height: -2 }], 360000), [
    { timestamp: 0, height: -2 },
  ]);
  const result = chartSeries(
    [
      { timestamp: 0, height: 1 },
      { timestamp: 360000, height: 2 },
      { timestamp: 3600000, height: 3 },
    ],
    360000,
  );
  assert.equal(result.length, 4);
  assert.equal(result[2].height, null);
});
