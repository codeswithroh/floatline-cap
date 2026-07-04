#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

exec /opt/homebrew/bin/node dist/src/cap/provider.js
