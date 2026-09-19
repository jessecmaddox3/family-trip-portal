# Design and maintenance

> **TL;DR:** This is the complete original content-driven trip portal, generalized into a static Next.js project. JSON becomes pages at build time. There is no database or guest-write API.

## Keep the product recognizable

The extraction preserves all ten route patterns and their original visual structure: the countdown/status home, trip subnavigation, schedule cards, layered tide chart and week strip, meal planner/history, packing groups, local guide, attendee groups, gallery and alternating expandable timeline. Original beach colors, wave decorations, rounded cards and Plus Jakarta Sans/Inter typography remain.

Personal narratives, named object keys, dates, destinations, source identifiers and media were replaced at their source. The example is independently authored, including its events, group structure and history; it is not a pseudonymized private dataset. The public repository starts with fresh history. Content provided by other people and all private documents/media were excluded.

## Data flow

`portal.config.json` selects the current year and brand. `src/lib/content.ts` loads strict schemas from `src/lib/schemas.ts`, checks references and exposes the same eight trip datasets to server-rendered pages. `generateStaticParams` enumerates supported years, and invalid years fail before file access. History-only memories need no fake detailed route.

Client code handles menu state, countdowns, history expansion, tide selection/chart interactions and local video. Editing is deliberately organizer-driven through files. A future RSVP or collaboration backend would require its own identity, authorization, persistence and privacy design; none is implied by the current packing labels.

All runtime fonts/media are local. External hyperlinks are optional and only act when opened. Provider acquisition is a separate CLI with explicit configuration. The default build and demo make no provider requests. Development dependencies are downloaded by npm during setup, not by the finished site.

## Time and tide corrections

The original chart mixed browser-local dates and fixed-offset samples. Shared Temporal helpers now use instants and an IANA trip zone. Calendar boundaries, repeated hours, complete timestamp calibration and clipped planning windows are tested. Empty/singleton/gapped curves retain honest unavailable states. There is no guessed continuity across gaps.

The original provider script silently substituted example values on request failure. The public tool validates candidates before atomic replacement and distinguishes direct predictions, reference-derived curves, fictional examples and unavailable series. It preserves the original segmented preference rules without inferring safe water or slack current from height.

## Building and hosting

Next static export creates `out/`. `NEXT_PUBLIC_BASE_PATH` configures a hosting prefix at build time; both Next links and ordinary media/local hyperlinks use it. A deterministic build ID hashes source, selected content/config, public assets, the lockfile and prefix. Changing a private content directory changes the ID without embedding its absolute filesystem path.

The built-in local server binds only to loopback, checks Host/Origin, limits reads to one real directory, supports video byte ranges and exposes no writes. It is a convenience for local use, not a public hosting or authentication server.

Source release packaging uses an explicit file manifest. Demo packaging includes the static export, a small Node server/launchers, original license and third-party notices. The package tool refuses private-content overrides and unlisted files under exportable source directories. CI exercises fresh installs and the fictional build; release checks also inspect exact archives and anonymous downloads.

## Verification boundaries

Core tests cover date/DST/calibration, acquisition parsing/coverage/failure preservation, activity rules, schema/render edge cases and local-server confinement. Chromium checks cover all routes at 320/390/768/1440 pixels, local video, navigation/history, unavailable data and timezone invariance with external requests blocked. An independent Astra review checks implementation and final release artifacts.

The release does not validate actual trip data, live NOAA stations, local water conditions, every video format or every host's access controls. Personal consumers should pin a reviewed version and keep real content outside the public repository. Test upgrades against a backup before changing an active trip.
