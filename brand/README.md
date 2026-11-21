# ReadVolley logo

OpenVolley's ball (unchanged: one Swiss Volley red `#e2001a` panel group, two
stone-900 `#1c1917` groups) resting on an open book in stone-900. Around the
ball the book is cut away by a gap as wide as the ball's seams, so the ball
sits in front of the pages. It is part of the same family as OpenVolley (the
ball on white) and OpenBeach (the ball on dune).

The SVGs here are the source of every logo file in the repo. Change an SVG,
then render the rasters and commit them together:

```bash
python3 scripts/make-brand-assets.py
```

(resvg through the Tauri CLI, like OpenVolley's brand script: `$TAURI_CLI`,
`node_modules/.bin/tauri` or `npx --yes @tauri-apps/cli@2`; Pillow.)

| File | What | Used for |
|---|---|---|
| `mark.svg` | Ball + book, 512 canvas, no background | apple-touch icon, maskable PWA icon, legacy Android launcher icons (square and round), pre-Android-12 splash |
| `icon-tile.svg` | White rounded tile with a stone-200 hairline, the mark inside | PWA `any` icons, the store icon (fastlane, F-Droid) |
| `favicon.svg` | Small-size cut: a bigger ball with OpenVolley's 4-seam cut, a heavier book, a wider gap | `public/favicon.ico` (16, 32, 48 px) |
| `adaptive-foreground.svg` | The mark scaled 0.72 so the book's corners stay in the adaptive icon's 66 dp safe circle | `mipmap-*/ic_launcher_foreground.png` (on the white `ic_launcher_background`), the Android 12+ splash |

The gaps are masks, not white shapes: they show whatever is behind the logo.
Don't recolour the ball's panels, make more than one group red, or put the
mark on a dark background (the ink book and panels would vanish).
