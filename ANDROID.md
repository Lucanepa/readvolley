# ReadVolley Android app

ReadVolley as an Android app, built with Capacitor from this repo. It follows
the setup of OpenVolley's and OpenBeach's apps (Capacitor shell, version rule,
release script, F-Droid pipeline) with its own id and its own signing key.

- Package: `com.openvolley.readvolley`, name **ReadVolley**
- Version 1.3.0 = versionCode `10030000`
- The APK bundles the **code only** (`CAPACITOR=true` build into
  `dist-capacitor/`, see `vite.config.js`). The rules data comes from the API
  of readvolley.openvolley.app and is kept on the phone (refreshed at most
  once a week, `src/services/api.js`). Images and documents are Swiss Volley
  and FIVB material, so they are not shipped in the APK: they load from the
  site and the service worker keeps the images for offline use.
- The app sends no `Referer` (`<meta name="referrer">` and the service
  worker's fetch): Cloudflare's hotlink protection answers 403 to image
  requests from another site, and the app's pages are `https://localhost`.
- No admin sign-in in the app: the API refuses `/api/login` from other
  origins (`functions/_middleware.js`). Editing stays on the website.
- PDF links open in the system browser; the NLA/NLB match report is handed to
  the share sheet (`saveFile` in `src/services/platform.js`), since the
  WebView ignores downloads.
- No `.env` files in this build: F-Droid builds the tag from source and must
  get the same bytes as the signed APK.

## Release

```bash
scripts/release-android.sh --bump 1.3.1  # set the version, write a changelog stub
# edit fastlane/metadata/android/en-US/changelogs/<versionCode>.txt, commit, git push
scripts/release-android.sh               # tag, build, sign, publish everywhere
scripts/release-android.sh --no-publish  # build only (unsigned release APK)
scripts/release-android.sh --debug       # debug APK, for the emulator
```

`--bump X.Y.Z` writes the version into `package.json`, `package-lock.json`,
`android/app/build.gradle` and the f-droid.org recipe copy, and creates the
changelog stub.

The plain run refuses a dirty tree, a commit that is not on `origin/main`, a
missing or unedited changelog, and a tag `android-v<version>` that already
points elsewhere. It then:

1. tags `android-v<version>` (if needed) and pushes the tag;
2. builds `dist-capacitor/`, runs `npx cap sync android` and
   `./gradlew assembleRelease`;
3. signs with `/srv/fdroid/desktop-calendar/add-apk.sh` and the ReadVolley
   key (zipalign, `apksigner --alignment-preserved true`) into the private
   F-Droid repo;
4. checks that the signature copies onto the unsigned build (F-Droid's
   reproducible-build check);
5. creates the GitHub release `android-v<version>` with the signed APK
   (f-droid.org downloads it from there, `Binaries` in the recipe);
6. publishes it to the OpenVolley F-Droid repo (get.openvolley.app/fdroid)
   with the openvolley repo's `escoresheet/deploy/publish-pkgs.sh`, from a
   worktree at its `origin/main` (`~/.cache/openvolley/wt-readvolley`), and
   checks the index. That repo's `lib/publish-lib.sh` knows ReadVolley's
   certificate; the F-Droid metadata is
   `~/.config/openvolley-pkgs/fdroid/metadata/com.openvolley.readvolley.yml`.

The store texts, icon, screenshots and changelogs are in
`fastlane/metadata/android/en-US/`. A reference copy of the f-droid.org
recipe is `android/fdroid/com.openvolley.readvolley.yml`: set `commit` to the
full hash of the tag `android-v<version>` before submitting it.

Needs JDK 21 and the Android SDK in `~/Android/Sdk` (the script sets
`ANDROID_HOME`).

## Signing key

`~/.config/readvolley-android/release.p12` + `signing.properties`
(certificate SHA-256 in `cert.sha256`). Back it up (Vaultwarden, "ReadVolley
Android signing key"). Every update must be signed with the same key forever.

## Version rule

One Android release = one version bump in `package.json` = one tag
`android-v<version>`. versionCode = (MAJOR * 1000000 + MINOR * 1000 + PATCH)
* 10; both values are written as literals in `android/app/build.gradle`
(F-Droid's update checker reads them with a regex), and the build fails if
they no longer match `package.json`. A tag F-Droid has built never moves.
The home screen footer shows the same version.
