# Security and privacy

> **TL;DR:** This is a static portal without authentication. Published content is public. Please report security defects privately.

Use the repository's GitHub **Security → Report a vulnerability** page for a sensitive report. Include a minimal fictional reproduction and affected version. Do not include real trip data or credentials in a public issue.

The default demo has no accounts, telemetry, remote media embeds or provider requests. The local server binds to 127.0.0.1, checks Host/Origin, serves one directory and has no write API. Optional external links work when clicked. Source setup downloads locked dependencies; explicit acquisition commands contact their documented providers.

JSON validation catches structural mistakes and unsafe link schemes. It does not anonymize content. Private hosting, authentication, backups and deciding what to share remain separate deployment responsibilities.
