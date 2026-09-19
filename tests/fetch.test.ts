import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  fetchTideData,
  writeTideData,
  fetchConfigSchema,
} from "../src/lib/tide-fetch";
const config = {
  stationName: "Test station",
  stationId: "1234567",
  timeZone: "UTC",
  start: "2030-07-10",
  end: "2030-07-10",
  units: "ft",
  datum: "MLLW",
  rules: [],
};
const fake = async () => ({
  predictions: Array.from({ length: 28 }, (_, i) => ({
    t: new Date(Date.UTC(2030, 6, 7, i * 6))
      .toISOString()
      .slice(0, 16)
      .replace("T", " "),
    v: i % 2 ? "2" : "-1",
    type: i % 2 ? "H" : "L",
  })),
});
test("explicit high/low-only acquisition requests GMT and labels curve unavailable", async () => {
  const urls: URL[] = [];
  const out = await fetchTideData(
    config,
    async (url) => {
      urls.push(url);
      return fake();
    },
    "2030-01-01T00:00:00Z",
  );
  assert.equal(urls.length, 1);
  assert.equal(urls[0].searchParams.get("time_zone"), "gmt");
  assert.equal(out.curveSource.kind, "unavailable");
  assert.equal(out.days[0].curve.length, 0);
  assert.equal(out.days[0].sunrise, undefined);
  assert.equal(out.highLowSource.kind, "noaa-prediction");
});
test("missing required curve coverage and invalid config fail before replacing output", async () => {
  assert.throws(() =>
    fetchConfigSchema.parse({ ...config, stationId: "YOUR_STATION" }),
  );
  await assert.rejects(
    fetchTideData(
      {
        ...config,
        curve: { stationId: "1234567", timeShiftMinutes: 0, heightScale: 1 },
      },
      fake,
    ),
  );
  const dir = await mkdtemp(path.join(tmpdir(), "portal-tides-")),
    file = path.join(dir, "tides.json");
  try {
    const out = await fetchTideData(config, fake);
    await writeTideData(file, out);
    const before = await readFile(file);
    await assert.rejects(
      (async () => {
        const next = await fetchTideData(config, async () => {
          throw new Error("timeout");
        });
        await writeTideData(file, next);
      })(),
    );
    assert.deepEqual(await readFile(file), before);
    await writeFile(file, '{"not":"tide data"}');
    await assert.rejects(writeTideData(file, out));
    assert.equal(await readFile(file, "utf8"), '{"not":"tide data"}');
  } finally {
    await rm(dir, { recursive: true });
  }
});
test("solar zero/null values stay unavailable and a valid solar response retains attribution", async () => {
  const out = await fetchTideData(
    { ...config, solar: { latitude: 0, longitude: 0 } },
    async (url) =>
      url.hostname.includes("sunrisesunset")
        ? {
            status: "OK",
            results: {
              date: config.start,
              sunrise: null,
              sunset: null,
              moon_phase: "New Moon",
            },
          }
        : fake(),
  );
  assert.equal(out.days[0].sunrise, undefined);
  assert.equal(out.days[0].moonPhase, "New Moon");
  assert.equal(out.days[0].sunSource.kind, "solar-prediction");
});

test("truncated high/low padding fails and malformed dates are schema errors", async () => {
  for (const predictions of [
    [{ t: "2030-07-10 12:00", v: "2", type: "H" }],
    (await fake()).predictions.filter((p) => p.t >= "2030-07-10"),
    (await fake()).predictions.filter((p) => p.t < "2030-07-11"),
  ])
    await assert.rejects(
      fetchTideData(config, async () => ({ predictions })),
      /coverage/,
    );
  assert.equal(
    fetchConfigSchema.safeParse({ ...config, start: "2030-02-30" }).success,
    false,
  );
});
