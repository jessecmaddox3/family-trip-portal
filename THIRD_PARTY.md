# Third-party software and fonts

> **TL;DR:** Original project work is MIT licensed. Dependencies and fonts retain their own licenses and notices; the MIT license does not replace those terms.

The two bundled fonts, Plus Jakarta Sans and Inter, use OFL-1.1. Exact pinned upstream files, hashes and unmodified licenses are in `third-party/font-provenance.json` and the corresponding `*-OFL.txt` files. They are self-hosted; the runtime does not contact a font service.

The application uses Next.js, React, Recharts, Zod and the Temporal polyfill, plus their dependencies. Installed production package versions and declared licenses are recorded in `third-party/dependencies.json`. Included notices, including Next's bundled libraries and Victory's vendored D3/InternMap packages, are preserved under `third-party/dependencies/`. Additional upstream notices and their hashes are recorded separately. `package-lock.json` pins installation and integrity hashes.

This ledger includes optional native build packages installed on the release machine. Native Node binaries, Sharp/libvips and `node_modules` are not distributed in either release ZIP. npm installs platform-appropriate packages from their upstream distributions during source setup. The demo ZIP contains the static browser output, media, fonts, Node server source and these notices.

`@next/env` and Next's SWC wrapper carry the Next.js MIT declaration and use the included Next license. The `client-only` package is React's MIT-licensed marker package; React's notice is included. Optional native-tool metadata is recorded for transparency, without relicensing or bundling those native libraries.

Optional provider data has separate source terms. The public demo contains none. See `docs/TIDES.md` for NOAA and SunriseSunset.io documentation and visible solar attribution. See `ASSETS.md` for original generated images, the synthetic clip and fictional data.
