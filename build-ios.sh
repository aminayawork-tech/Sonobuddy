#!/bin/bash
# build-ios.sh
# Generates the Next.js static export and copies it into the iOS app bundle.
# Run this from the repo root before building/archiving in Xcode.
#
# Usage:
#   chmod +x build-ios.sh   (first time only)
#   ./build-ios.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$SCRIPT_DIR/out"
IOS_WEBAPP_DIR="$SCRIPT_DIR/ios/SonoBuddy/WebApp"
API_DIR="$SCRIPT_DIR/app/api"
API_BACKUP="$SCRIPT_DIR/api_ios_backup"

# Always restore API routes on exit (even if build fails)
cleanup() {
  if [ -d "$API_BACKUP" ]; then
    mv "$API_BACKUP" "$API_DIR"
    echo "==> Restored app/api"
  fi
}
trap cleanup EXIT

echo "==> Temporarily hiding API routes (not needed in iOS bundle)..."
mv "$API_DIR" "$API_BACKUP"

echo "==> Building Next.js static export..."
cd "$SCRIPT_DIR"
npm run build

echo "==> Copying to iOS bundle at ios/SonoBuddy/WebApp/..."
rm -rf "$IOS_WEBAPP_DIR"
cp -r "$OUT_DIR" "$IOS_WEBAPP_DIR"

echo ""
echo "Done! Next steps in Xcode:"
echo "  1. If 'WebApp' folder isn't in your Xcode project yet:"
echo "     - Right-click the SonoBuddy group → Add Files to 'SonoBuddy'"
echo "     - Select ios/SonoBuddy/WebApp"
echo "     - Choose 'Create folder references' (blue folder icon, NOT yellow group)"
echo "     - Tick the SonoBuddy target checkbox"
echo "     - Click Add"
echo "  2. Build & Archive as normal (Product → Archive)"
