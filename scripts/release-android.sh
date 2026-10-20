#!/usr/bin/env bash
# Release the ReadVolley Android app (Capacitor). See ANDROID.md.
# Adapted from OpenBeach's scripts/release-android.sh.
#
#   scripts/release-android.sh --bump 1.3.1  # 1. set the version, write a changelog stub
#   scripts/release-android.sh               # 2. tag, build, sign, publish everywhere
#   scripts/release-android.sh --no-publish  # build only (unsigned)
#   scripts/release-android.sh --debug       # debug APK (emulator tests)
#
# A release, start to finish:
#   1. --bump X.Y.Z writes the version into package.json, android/app/build.gradle
#      and the f-droid.org recipe copy, and a changelog stub. Edit the changelog,
#      commit, push main.
#   2. The plain run (from that clean, pushed commit) tags android-vX.Y.Z and
#      pushes the tag, builds the release APK, signs it with the ReadVolley key
#      into the private F-Droid repo, checks that F-Droid's reproducible-build
#      check will pass, creates the GitHub release with the APK (f-droid.org
#      downloads it from there) and publishes it to the OpenVolley F-Droid repo
#      (get.openvolley.app/fdroid) with the openvolley repo's publish-pkgs.sh.
#
# The APK bundles the code only; the rules data, images and documents come
# from readvolley.openvolley.app. Web changes that should reach the app need
# a version bump and a new release.
# versionName = package.json version, versionCode = (MAJOR*1000000 + MINOR*1000
# + PATCH) * 10 (android/app/build.gradle, ANDROID.md "Version rule").
#
# Signing key: ~/.config/readvolley-android/ (release.p12 + signing.properties).
# ReadVolley has its own key; updates must be signed with the same key forever.
set -euo pipefail
cd "$(dirname "$0")/.."

APP_ID=com.openvolley.readvolley
SIGNING=${SIGNING:-$HOME/.config/readvolley-android/signing.properties}
ADD_APK=/srv/fdroid/desktop-calendar/add-apk.sh
# A worktree of the openvolley repo, reset to its origin/main for each publish
OPENVOLLEY_REPO=${OPENVOLLEY_REPO:-$HOME/repos/openvolley}
OPENVOLLEY_WT=${OPENVOLLEY_WT:-$HOME/.cache/openvolley/wt-readvolley}
CHANGELOGS=fastlane/metadata/android/en-US/changelogs
RECIPE=android/fdroid/$APP_ID.yml
export ANDROID_HOME=${ANDROID_HOME:-$HOME/Android/Sdk}
export ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT:-$ANDROID_HOME}

die() { echo "release-android: $*" >&2; exit 1; }
version_code() { local IFS=.; set -- $1; echo $(( ($1 * 1000000 + $2 * 1000 + $3) * 10 )); }

mode=${1:-publish}
case "$mode" in
  publish|--no-publish|--debug) ;;
  --bump)
    v=${2:-}
    [[ "$v" =~ ^(0|[1-9][0-9]*)\.(0|[1-9][0-9]{0,2})\.(0|[1-9][0-9]{0,2})$ ]] || die "--bump needs a version like 1.3.1"
    code=$(version_code "$v")
    old=$(node -p 'require("./package.json").version')
    (( code > $(version_code "$old") )) || die "$v is not newer than $old"
    # package.json and the two copies of the version in package-lock.json
    node -e '
      const fs = require("fs"), v = process.argv[1]
      const edit = (f, set) => { const d = JSON.parse(fs.readFileSync(f, "utf8")); set(d); fs.writeFileSync(f, JSON.stringify(d, null, 2) + "\n") }
      edit("package.json", d => { d.version = v })
      edit("package-lock.json", d => { d.version = v; d.packages[""].version = v })' "$v"
    sed -i -E "s/^( +versionCode )[0-9]+$/\1$code/; s/^( +versionName )\"[^\"]*\"$/\1\"$v\"/" android/app/build.gradle
    sed -i -E "s/^(  - versionName: ).*/\1$v/; s/^(    versionCode: ).*/\1$code/; s/^(    commit: ).*/\1FULL_HASH_OF_TAG_android-v$v/; s/^(CurrentVersion: ).*/\1$v/; s/^(CurrentVersionCode: ).*/\1$code/" "$RECIPE"
    [[ -f "$CHANGELOGS/$code.txt" ]] || printf 'ReadVolley %s.\n- \n' "$v" > "$CHANGELOGS/$code.txt"
    echo "version $v ($code). Next: edit $CHANGELOGS/$code.txt, commit, git push, then scripts/release-android.sh"
    exit 0 ;;
  *) echo "usage: $0 [--bump X.Y.Z | --no-publish | --debug]" >&2; exit 2 ;;
esac

name=$(sed -nE 's/^ +versionName "(.*)"$/\1/p' android/app/build.gradle)
code=$(sed -nE 's/^ +versionCode ([0-9]+)$/\1/p' android/app/build.gradle)
tag=android-v$name

# F-Droid builds the tag from source and checks it against this APK byte for
# byte (reproducible builds), so publish only a clean commit that is on GitHub.
# The web bundle ignores .env files in this build (vite.config.js).
if [ "$mode" = publish ]; then
  [ -f "$SIGNING" ] || die "no signing config at $SIGNING (the ReadVolley key, ANDROID.md)"
  [ -z "$(git status --porcelain)" ] || die "the tree has uncommitted or untracked files; commit them first"
  [ -s "$CHANGELOGS/$code.txt" ] || die "no changelog $CHANGELOGS/$code.txt (scripts/release-android.sh --bump $name)"
  ! grep -qx -- '- ' "$CHANGELOGS/$code.txt" || die "$CHANGELOGS/$code.txt still has the empty stub line"
  git fetch -q origin main --tags
  git merge-base --is-ancestor HEAD origin/main || die "HEAD is not on origin/main; push it first"
  if git rev-parse -q --verify "refs/tags/$tag" >/dev/null; then
    [ "$(git rev-list -n1 "$tag")" = "$(git rev-parse HEAD)" ] ||
      die "$tag already exists on another commit; a tag F-Droid builds never moves: bump the version (--bump)"
  else
    git tag -a "$tag" -m "ReadVolley Android $name"
  fi
  git push -q origin "refs/tags/$tag"
  echo "building $tag ($(git rev-parse HEAD))"
fi

# CAPACITOR=true: code only, output in dist-capacitor (vite.config.js).
CAPACITOR=true npx vite build
npx cap sync android

if [ "$mode" = --debug ]; then
  (cd android && ./gradlew --no-daemon -q assembleDebug)
  echo "built android/app/build/outputs/apk/debug/app-debug.apk"
  exit 0
fi

(cd android && ./gradlew --no-daemon -q assembleRelease)
APK=android/app/build/outputs/apk/release/app-release-unsigned.apk
echo "built $APK"
[ "$mode" = publish ] || exit 0

# 1. Sign into the private F-Droid repo
"$ADD_APK" "$APK" "$SIGNING"
SIGNED=/srv/fdroid/desktop-calendar/repo/${APP_ID}_${code}.apk

# 2. F-Droid compares its own build against the signed APK (Binaries in the
# recipe): it copies this APK's signature onto its unsigned build and verifies
# it. Do the same here, so a signing step that rewrites the ZIP is caught now
# and not in F-Droid's pipeline.
bt=$(ls -d "$ANDROID_HOME"/build-tools/* | sort -V | tail -1)
python3 - "$SIGNED" "$APK" "$bt/apksigner" <<'PY' ||
import os, subprocess, sys, tempfile
from fdroidserver import apksigcopier
signed, unsigned, apksigner = sys.argv[1:4]
with tempfile.TemporaryDirectory() as d:
    out = os.path.join(d, 'copied.apk')
    apksigcopier.do_copy(signed, unsigned, out)
    ok = subprocess.run([apksigner, 'verify', out], capture_output=True).returncode == 0
sys.exit(0 if ok else 1)
PY
  die "$SIGNED does not match the unsigned build once its signature is copied: F-Droid's reproducible-build check would fail (sign with apksigner --alignment-preserved true)"
echo "reproducible: signature of $SIGNED copies onto the unsigned build"

# 3. GitHub release with the signed APK (f-droid.org downloads it from there)
if gh release view "$tag" --repo Lucanepa/readvolley >/dev/null 2>&1; then
  echo "GitHub release $tag exists, left as it is"
else
  gh release create "$tag" "$SIGNED" --repo Lucanepa/readvolley --verify-tag \
    --title "ReadVolley Android $name" --notes-file "$CHANGELOGS/$code.txt"
fi

# 4. OpenVolley F-Droid repo (get.openvolley.app/fdroid), with the openvolley
# repo's publish tooling at its origin/main (it knows ReadVolley's certificate)
git -C "$OPENVOLLEY_REPO" fetch -q origin main
if [ -d "$OPENVOLLEY_WT" ]; then
  git -C "$OPENVOLLEY_WT" checkout -q --detach origin/main
else
  git -C "$OPENVOLLEY_REPO" worktree add -q --detach "$OPENVOLLEY_WT" origin/main
fi
(cd "$OPENVOLLEY_WT" && escoresheet/deploy/publish-pkgs.sh "$SIGNED")
curl -fsS https://get.openvolley.app/fdroid/repo/index-v2.json | python3 -c '
import json, sys
app, code = sys.argv[1], int(sys.argv[2])
p = json.load(sys.stdin).get("packages", {}).get(app, {})
ok = any(v["manifest"]["versionCode"] == code for v in p.get("versions", {}).values())
print(("published: %s %d is in the OpenVolley F-Droid index" if ok else "NOT in the OpenVolley F-Droid index: %s %d") % (app, code))
sys.exit(0 if ok else 1)' "$APP_ID" "$code"

echo "f-droid.org (once the app is listed there): put commit $(git rev-parse HEAD) into the recipe's new build entry"
