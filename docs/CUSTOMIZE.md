# Make the portal your own

> **TL;DR:** Edit the brand file, then one trip folder. Validate and rebuild. The website displays those files; it does not save guest edits.

## Start with a small change

Keep an untouched copy of the download. Open `portal.config.json` in a plain text editor, change `brandName`, save it, and run the launcher again. Once that works, change one trip file at a time. Stop the earlier terminal with Control+C before launching again.

`demo: true` shows the fictional-demo banner. `demoNow` gives the countdown a clearly labeled example clock, starting at that instant each time the page opens. For real use set `demo` to `false` and remove `demoNow`. Never leave the fictional label on real data.

## The files

The same eight files make a complete trip. Empty arrays are allowed for pages you have not filled in. A tide file can have an empty `days` array and an honest unavailable-source description.

| File in `content/trips/YYYY/` | Edit here                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `trip.json`                   | Year, destination, dates, IANA timezone, check-in/out timestamps, meal introduction, optional featured event and house details |
| `schedule.json`               | Dated days and events; time labels are written in the trip's local time                                                        |
| `meals.json`                  | Dated menus; use `chefs: []` for an unassigned night                                                                           |
| `packing.json`                | Unique IDs, categories, quantities and optional `claimedBy`; omit an unassigned name                                           |
| `guide.json`                  | Restaurants, beaches, groceries, activities and information                                                                    |
| `people.json`                 | Names/groups and explicit `confirmed`, `tentative` or `declined` status                                                        |
| `photos.json`                 | Local image/video files and links to albums                                                                                    |
| `tides.json`                  | Validated chart data; use the optional tool for real predictions                                                               |

`content/trips/history.json` is the timeline. A memory may exist without a complete trip folder; it then has no “View trip details” link. Keep recaps consistent with the trip files, or explain that a plan changed. `traditions.json` contains custom cards. `family-videos.json` contains optional archive, playlist and remembrance sections; `memorial` is an array and may be empty.

## Add another year

Copy an example year folder, rename it to four digits, update `trip.json` and every dated file, then set `portal.config.json` → `currentYear`. The navigation discovers complete year directories. A malformed year or unsupported URL returns a missing-page response. The build validates the current year and cross-file date/timezone consistency.

Check-in and check-out need complete timestamps with an explicit offset, such as `2034-08-12T16:00:00-04:00`. The configured IANA zone, such as `America/New_York`, controls display and day grouping. The offset must describe the intended instant. Tide samples use epoch milliseconds, not ambiguous clock strings. [Tide notes](TIDES.md) explain daylight-saving behavior.

## Add media and links

Put owned or permitted media in `public/media/`. In JSON, refer to it as `/media/your-file.png`, not a path on your computer. Photos need `src`, `alt`, `year` and optionally `caption`/`credit`. Videos use `type: "video"`, a browser-playable local `src`, optional local `poster` and a WebVTT `captions` file. Keep captions for speech and meaningful sound. Test your actual video format in the browsers your group uses.

Album entries use `type: "album-link"`, an explanatory `alt` title, a year and `externalUrl`. Links may be local `/paths` or `https://` URLs. Remote media is not automatically embedded: copy permitted images locally. External video and playlist links open only when clicked; there are no third-party thumbnails or embeds in the default demo.

Optional phone/email fields are displayed as contact links. Do not put credentials, private share tokens or information you are unwilling to expose into a published content file.

## Validate and run

The launcher validates and rebuilds. In a terminal, the same steps are `npm run validate`, `npm run build`, `npm start`. A JSON error names the file or field to fix. Changes to files become visible after rebuilding; reloading an old static build alone does not rebuild it.

For a separate private content directory, set `PORTAL_CONTENT_DIR` to a folder with the same `trips/` structure and `PORTAL_CONFIG` to its separate brand JSON before building. Those files are still embedded in the generated output. These settings separate source storage; they are not access controls. Back up real content before replacing files or upgrading.

## Share a finished copy

The `out/` folder is a static site. A static host can serve it without Node at runtime. If hosting under `/holiday`, build with `NEXT_PUBLIC_BASE_PATH=/holiday` and put the resulting output at that URL. The path has no trailing slash. The build must know it in advance so links, fonts, media and framework files agree.

All published output can be read by visitors. A private family portal needs an access-controlled host or a separate authentication layer. The starter includes neither. Test an isolated fictional copy before changing a real group's site.
