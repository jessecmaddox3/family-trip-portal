# Contributing

> **TL;DR:** Small, tested improvements are welcome. Use invented data and explain the user-visible change.

Open an issue or pull request with the problem, what you changed and how you checked it. Useful areas include clearer first-run setup, keyboard/contrast improvements, content validation, more flexible trip structures and documented provider edge cases.

Install with `npm ci --ignore-scripts`. Run `npm test`, `npm run typecheck`, `npm run lint` and `npm run build`. For browser checks, install Chromium with `npx playwright install chromium`, then run `npm run test:browser`. Browser tests block external requests. Provider tests use injected fake responses; do not replace them with live requests.

Keep changes scoped. Add regression tests for behavior bugs and use the existing visual language. Preserve all route types and the read-only data-file model unless the proposal explicitly changes it. Never include real trip files, addresses, contacts, private share URLs, keys or family media in a pull request or screenshot.

Contributions to original code are offered under the repository's MIT license. Keep third-party notices intact. No service-level or review-time commitment is implied.
