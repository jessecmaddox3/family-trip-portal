# Tide and activity planning

> **TL;DR:** The demo uses an independently invented cosine wave. Real acquisition is optional and explicit. Predictions, derived curves and unavailable data stay distinct; activity labels describe organizer preferences.

## Configure an explicit fetch

Create a private JSON file following `templates/fetch-tides.example.json`. Replace its station placeholder with a NOAA station you have verified. Use the desired date range, trip IANA timezone, units and datum. The example placeholder deliberately fails validation before any network request.

```sh
npm run fetch-tides -- YOUR-CONFIG.json NEW-TIDES.json
```

Review the new file before copying it into `content/trips/YYYY/tides.json`. The tool fetches at most 21 trip days at once. It requests surrounding UTC dates so a next-day tide can produce a previous-evening planning window. It checks high/low coverage and any requested six-minute curve, validates the complete result and writes through a temporary sibling file. A failed request, invalid response or missing required coverage preserves the previous output. It refuses to overwrite unrelated JSON. Do not run concurrent fetches into one destination.

Omit `curve` when the station has high/low data only. If using a reference station, configure its own station ID and explicit `timeShiftMinutes` and `heightScale`. These are your calibration assumptions, not a validated prediction model for a different place. Both series retain station/range/fetch provenance and the UI displays the adjustment. No old location-specific calibration is built in.

Add `solar: {"latitude": ..., "longitude": ...}` only when you want the optional solar request. Coordinates of zero are valid. Solar requests use epoch output with the configured timezone and retain provider attribution. Unavailable polar events remain absent. A configured solar request failure fails the fetch; omitting solar is an intentional unavailable state. The demo never downloads solar or lunar data.

## Organizer rules

The example rule files preserve the original range of planning behavior: beach and shelling segments, paddle and fishing preferences, one dated gathering and a venue with opening hours and a closed weekday. They are illustrative preferences, not claims about real conditions.

Each rule has a unique `id`, generic activity name, label, high/low/either anchor, and one or more segments with minute offsets, a fit label and a reason. Optional filters select the first eligible extremum per day, a local anchor-hour range, specific displayed dates, weekdays (Monday 1 through Sunday 7), opening hours and a details link. Dates and weekday closures apply to the actual displayed fragments, so a closed day never inherits an open previous day's window.

Opening and anchor hours use decimal hours at whole-minute precision, for example 8.5 for 08:30. Opening intervals are evaluated against actual local clock minutes. A repeated autumn interval has two separate portions; nonexistent spring minutes never appear. Tide offsets always move the complete instant before grouping. Calendar days may contain 23 or 25 hours.

A window crossing midnight appears as one fragment on each displayed day, with the original window identity retained. Multiple fit segments remain separate. The graph uses real elapsed time, supports negative heights, breaks across missing samples, and supplies a values table. Clock labels include UTC offsets so repeated hours are distinguishable.

## Sources and limits

NOAA requests use its `predictions` product, GMT timestamps, explicit units/datum and `hilo` or six-minute intervals. Subordinate stations may offer high/low predictions only. [NOAA API](https://api.tidesandcurrents.noaa.gov/api/prod/), [NOAA prediction help](https://tidesandcurrents.noaa.gov/noaatidepredictionshelp.html).

High or low tide does not establish slack current. The portal makes no inference that water is safe, calm or navigable. Check the relevant local forecasts, current predictions, access rules and official guidance before water activities. [NOAA FAQ](https://tidesandcurrents.noaa.gov/faq.html).

Optional solar/lunar data comes from [SunriseSunset.io](https://sunrisesunset.io/api/), with a visible attribution link when used. These are predictions, not observations. The public demo contains no provider data. Live provider acquisition is covered by injected-response tests; a live station request has not been used to validate this release.
