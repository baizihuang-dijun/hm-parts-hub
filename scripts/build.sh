#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies..."
bash "$COZE_WORKSPACE_PATH/scripts/prepare-node-modules.sh" --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only

echo "Running pre-build data & compliance assertions..."
node scripts/check-data.mjs pre

echo "Building the Next.js project (static export to out/)..."
pnpm next build --webpack

echo "Running post-build export assertions..."
node scripts/check-data.mjs post

echo "Bundling static server with tsup..."
pnpm tsup src/server.ts --format cjs --platform node --target node20 --outDir dist --no-splitting --no-minify

echo "Build completed successfully!"
