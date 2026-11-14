#!/bin/bash
# Opens the latest SonoBuddy iOS project in Xcode, ready to Archive.
#
# Builds from a separate copy at ~/sonobuddy-ios-build, outside the
# iCloud-synced ~/Documents folder: iCloud syncing makes git pulls hang and
# stalls Xcode while it copies the bundled web app. The copy is refreshed
# from GitHub's main branch every run, so it always has the newest code.
#
# One-time setup (adds a `sonoxcode` command to Terminal):
#   echo "alias sonoxcode='bash ~/sonobuddy-ios-build/scripts/open-xcode.sh'" >> ~/.zshrc && source ~/.zshrc
#
# Then whenever you need an iOS build, just run:
#   sonoxcode

# Wrapped in braces so bash reads the whole script before running it: the
# git reset below can replace this very file mid-run.
{
set -e

REPO_URL="https://github.com/aminayawork-tech/Sonobuddy.git"
BUILD_DIR="$HOME/sonobuddy-ios-build"
PROJECT="$BUILD_DIR/ios/SonoBuddy.xcodeproj"

echo "==> Getting the latest code from GitHub..."
if [ -d "$BUILD_DIR/.git" ]; then
  git -C "$BUILD_DIR" fetch --depth 1 origin main
  git -C "$BUILD_DIR" reset --hard origin/main
  git -C "$BUILD_DIR" clean -fdq
else
  rm -rf "$BUILD_DIR"
  git clone --depth 1 "$REPO_URL" "$BUILD_DIR"
fi

VERSION=$(grep -m1 "MARKETING_VERSION" "$PROJECT/project.pbxproj" | sed 's/[^0-9.]//g')
BUILD=$(grep -m1 "CURRENT_PROJECT_VERSION" "$PROJECT/project.pbxproj" | sed 's/[^0-9]//g')
COMMIT=$(git -C "$BUILD_DIR" log -1 --format='%h %s')

if [ ! -f "$BUILD_DIR/ios/SonoBuddy/WebApp/home/index.html" ]; then
  echo "!! The bundled web app is missing. Don't archive; ask Claude to check."
  exit 1
fi

echo ""
echo "    Version: $VERSION"
echo "    Build:   $BUILD"
echo "    Latest:  $COMMIT"
echo ""
echo "==> Opening Xcode..."
open "$PROJECT"

echo ""
echo "Next in Xcode:"
echo "  1. Check General shows Version $VERSION and Build $BUILD"
echo "  2. Set the device to 'Any iOS Device (arm64)'"
echo "  3. Product -> Archive, then Distribute App -> App Store Connect -> Upload"
echo ""
echo "Each upload needs a new Build number. If Apple says $BUILD was already used, ask Claude to bump it."
exit 0
}
