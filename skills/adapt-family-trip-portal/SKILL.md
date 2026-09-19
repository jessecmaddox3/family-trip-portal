---
name: adapt-family-trip-portal
description: Customize the Family Trip Portal starter for a user's trip, preserving its full pages and keeping personal content out of public examples.
---

# Adapt Family Trip Portal

Read README.md, docs/CUSTOMIZE.md and the current portal.config.json. Establish whether the user wants a fictional public demo, local personal use or a privately hosted real trip. The existing user instructions determine what is authorized.

Preserve the useful product: home/countdown, house, schedule, tides, meals/history, packing, guide, people, photo/video gallery, timeline, traditions and archive. Keep the beach design and local font families unless the user requests another design. Do not reduce the project to a landing-page mockup.

Inspect the eight trip-file schemas in src/lib/schemas.ts. Ask only for missing facts that materially affect the requested result. Never invent real bookings, dietary needs, contact details, family stories, tide values or safety claims. Use explicit unavailable states or clearly fictional examples.

Keep a backup before changing real content. Use separate private content/config paths when useful. A static build embeds the content; separate files and unlisted URLs are not privacy controls. Publishing real personal content needs the applicable authorization and an appropriate hosting boundary.

Use exact year folders, explicit IANA zones and check-in/out timestamps with offsets. Read docs/TIDES.md before changing tide rules. Never invoke providers during ordinary setup or build. A fetch is a separate, explicit user-directed step; inspect proposed station/config and save to a new output first.

Preserve source/media rights. Use owned local images and video with useful alt text, captions and attribution. Do not copy private family media into public demonstrations. Public examples should be independently invented, not pseudonymized versions of real stories.

Run content validation, relevant regression tests, typecheck, lint and build. Exercise affected routes in an isolated browser, including a phone width and any deployment prefix. Check links, gallery playback, empty states and timezone behavior. Explain the read-only editing model accurately.

For handoff, identify changed files, what was verified, how to start the portal, where private content remains and any unverified provider or hosting behavior. Keep credentials and personal details out of public issues, screenshots and logs.
