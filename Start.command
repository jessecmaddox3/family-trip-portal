#!/bin/sh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'Install Node.js 22 or newer from https://nodejs.org, then open Start.command again.'
  read -r answer
  exit 1
fi
node scripts/start.mjs "$@"
portal_exit=$?
if [ "$portal_exit" -ne 0 ]; then printf '%s\n' 'Press Return to close.'; read -r answer; fi
exit "$portal_exit"
