#!/bin/bash
# build-android.sh
# Generates the Next.js static export and syncs it into the Android Capacitor project.
# Run this from the repo root before building/archiving in Android Studio.
#
# Usage:
#   chmod +x build-android.sh   (first time only)
#   ./build-android.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_DIR="$SCRIPT_DIR/app/api"
API_BACKUP="$SCRIPT_DIR/api_android_backup"

# Always restore API routes on exit (even if build fails)
cleanup() {
  if [ -d "$API_BACKUP" ]; then
    mv "$API_BACKUP" "$API_DIR"
    echo "==> Restored app/api"
  fi
}
trap cleanup EXIT

echo "==> Temporarily hiding API routes (not needed in Android bundle)..."
if [ -d "$API_DIR" ]; then
  mv "$API_DIR" "$API_BACKUP"
else
  echo "    (no app/api directory found, skipping)"
fi

echo "==> Building Next.js static export..."
cd "$SCRIPT_DIR"
NEXT_STATIC_EXPORT=true npm run build

echo "==> Syncing web assets into Android project..."
npx cap sync android

echo ""
echo "Done! Next steps in Android Studio:"
echo "  1. Open the android/ folder in Android Studio"
echo "  2. Let Gradle sync complete"
echo "  3. To test: Run → Run 'app' on a connected device or emulator"
echo "  4. To publish: Build → Generate Signed Bundle / APK"
echo "     → Choose Android App Bundle (.aab) for Google Play"
echo "     → Sign with your keystore (create one if first time)"
